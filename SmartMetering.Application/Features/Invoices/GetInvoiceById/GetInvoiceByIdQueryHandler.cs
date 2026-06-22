using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartMetering.Application.Interfaces;
using SmartMetering.Contracts.Invoices;
using SmartMetering.Domain.Common;

namespace SmartMetering.Application.Features.Invoices.GetInvoiceById;

public class GetInvoiceByIdQueryHandler
    : IRequestHandler<GetInvoiceByIdQuery, Result<InvoiceDetailResponse>>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetInvoiceByIdQueryHandler(IAppDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<InvoiceDetailResponse>> Handle(
        GetInvoiceByIdQuery request, CancellationToken cancellationToken)
    {
        var invoice = await _context.Invoices
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == request.InvoiceId, cancellationToken);

        if (invoice is null)
            return Result<InvoiceDetailResponse>.Failure(
                Error.NotFound("Invoices.NotFound", "Invoice not found."));

        if (invoice.UserId != _currentUser.UserId)
            return Result<InvoiceDetailResponse>.Failure(
                Error.Unauthorized("Invoices.Forbidden", "You do not own this invoice."));

        var property = await _context.Properties
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == invoice.PropertyId, cancellationToken);

        var meter = await _context.Meters
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == invoice.MeterId, cancellationToken);

        var response = new InvoiceDetailResponse(
            invoice.Id,
            invoice.PropertyId,
            invoice.MeterId,
            invoice.Month,
            invoice.Year,
            invoice.HighTariffKwh,
            invoice.LowTariffKwh,
            invoice.TotalKwh,
            invoice.GreenZoneKwh,
            invoice.BlueZoneKwh,
            invoice.RedZoneKwh,
            invoice.EnergyCharge,
            invoice.PowerCharge,
            invoice.SupplierCharge,
            invoice.TotalAmount,
            invoice.Status.ToString(),
            invoice.PaidAtUtc,
            invoice.DocumentPath != null,
            invoice.CreatedAtUtc,
            property?.Name ?? "Unknown",
            property?.Address ?? "Unknown",
            meter?.Label ?? "Unknown",
            meter?.SerialNumber ?? "Unknown");

        return Result<InvoiceDetailResponse>.Success(response);
    }
}
