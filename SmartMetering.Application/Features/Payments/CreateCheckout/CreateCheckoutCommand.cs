using MediatR;
using SmartMetering.Contracts.Payments;
using SmartMetering.Domain.Common;

namespace SmartMetering.Application.Features.Payments.CreateCheckout;

public record CreateCheckoutCommand(Guid InvoiceId) : IRequest<Result<CheckoutResponse>>;
