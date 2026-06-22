using MediatR;
using SmartMetering.Domain.Common;

namespace SmartMetering.Application.Features.Payments.HandleWebhook;

public record HandleStripeWebhookCommand(string Payload, string Signature) : IRequest<Result>;
