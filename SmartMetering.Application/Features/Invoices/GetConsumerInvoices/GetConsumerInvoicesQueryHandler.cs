using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartMetering.Application.Interfaces;
using SmartMetering.Contracts.Invoices;
using SmartMetering.Domain.Common;

namespace SmartMetering.Application.Features.Invoices.GetConsumerInvoices;

public class GetConsumerInvoicesQueryHandler
    : IRequestHandler<GetConsumerInvoicesQuery, Result<InvoiceListResponse>>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetConsumerInvoicesQueryHandler(IAppDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<InvoiceListResponse>> Handle(
        GetConsumerInvoicesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Invoices
            .AsNoTracking()
            .Where(i => i.UserId == _currentUser.UserId);

        if (request.PropertyId.HasValue)
        {
            query = query.Where(i => i.PropertyId == request.PropertyId.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 10 : request.PageSize;
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var items = await query
            .OrderByDescending(i => i.Year)
            .ThenByDescending(i => i.Month)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new InvoiceResponse(
                i.Id,
                i.PropertyId,
                i.MeterId,
                i.Month,
                i.Year,
                i.HighTariffKwh,
                i.LowTariffKwh,
                i.TotalKwh,
                i.GreenZoneKwh,
                i.BlueZoneKwh,
                i.RedZoneKwh,
                i.EnergyCharge,
                i.PowerCharge,
                i.SupplierCharge,
                i.TotalAmount,
                i.Status.ToString(),
                i.PaidAtUtc,
                i.DocumentPath != null,
                i.CreatedAtUtc))
            .ToListAsync(cancellationToken);

        var response = new InvoiceListResponse(items, page, pageSize, totalCount, totalPages);

        return Result<InvoiceListResponse>.Success(response);
    }
}
