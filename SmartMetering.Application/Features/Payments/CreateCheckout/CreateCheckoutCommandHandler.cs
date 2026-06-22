using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartMetering.Application.Interfaces;
using SmartMetering.Contracts.Payments;
using SmartMetering.Domain.Common;
using SmartMetering.Domain.Enums;

namespace SmartMetering.Application.Features.Payments.CreateCheckout;

public class CreateCheckoutCommandHandler
    : IRequestHandler<CreateCheckoutCommand, Result<CheckoutResponse>>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IPaymentService _paymentService;

    public CreateCheckoutCommandHandler(
        IAppDbContext context,
        ICurrentUser currentUser,
        IPaymentService paymentService)
    {
        _context = context;
        _currentUser = currentUser;
        _paymentService = paymentService;
    }

    public async Task<Result<CheckoutResponse>> Handle(
        CreateCheckoutCommand request, CancellationToken cancellationToken)
    {
        var invoice = await _context.Invoices
            .FirstOrDefaultAsync(i => i.Id == request.InvoiceId, cancellationToken);

        if (invoice is null)
            return Result<CheckoutResponse>.Failure(
                Error.NotFound("Payment.InvoiceNotFound", "Invoice not found."));

        if (invoice.UserId != _currentUser.UserId)
            return Result<CheckoutResponse>.Failure(
                Error.Unauthorized("Payment.NotOwner", "You can only pay your own invoices."));

        if (invoice.Status != InvoiceStatus.Unpaid)
            return Result<CheckoutResponse>.Failure(
                Error.Validation("Payment.AlreadyPaid", "This invoice has already been paid."));

        var description = $"Invoice {invoice.Month:D2}/{invoice.Year} - Smart Metering";

        var (sessionId, checkoutUrl) = await _paymentService.CreateCheckoutSessionAsync(
            invoice.Id,
            invoice.TotalAmount,
            description,
            successUrl: "https://smartmetering.azurewebsites.net/payments/success",
            cancelUrl: "https://smartmetering.azurewebsites.net/payments/cancel");

        invoice.SetStripeSessionId(sessionId);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<CheckoutResponse>.Success(
            new CheckoutResponse(sessionId, checkoutUrl));
    }
}
