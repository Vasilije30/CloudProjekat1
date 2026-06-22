using MediatR;
using SmartMetering.Contracts.Invoices;
using SmartMetering.Domain.Common;

namespace SmartMetering.Application.Features.Invoices.GetConsumerInvoices;

public record GetConsumerInvoicesQuery(Guid? PropertyId, int Page = 1, int PageSize = 10)
    : IRequest<Result<InvoiceListResponse>>;
