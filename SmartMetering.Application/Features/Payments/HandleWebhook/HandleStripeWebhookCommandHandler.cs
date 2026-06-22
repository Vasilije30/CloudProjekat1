using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartMetering.Application.Interfaces;
using SmartMetering.Domain.Common;

namespace SmartMetering.Application.Features.Payments.HandleWebhook;

public class HandleStripeWebhookCommandHandler
    : IRequestHandler<HandleStripeWebhookCommand, Result>
{
    private readonly IAppDbContext _context;
    private readonly IPaymentService _paymentService;

    public HandleStripeWebhookCommandHandler(
        IAppDbContext context,
        IPaymentService paymentService)
    {
        _context = context;
        _paymentService = paymentService;
    }

    public async Task<Result> Handle(
        HandleStripeWebhookCommand request, CancellationToken cancellationToken)
    {
        var paymentResult = await _paymentService.VerifyAndExtractPaymentAsync(
            request.Payload, request.Signature);

        if (paymentResult is null)
            return Result.Success(); // Not a checkout.session.completed event, ignore

        var invoice = await _context.Invoices
            .FirstOrDefaultAsync(
                i => i.StripeSessionId == paymentResult.SessionId,
                cancellationToken);

        if (invoice is null)
            return Result.Failure(
                Error.NotFound("Webhook.InvoiceNotFound",
                    "No invoice found for this Stripe session."));

        invoice.MarkPaid(paymentResult.PaymentIntentId);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
