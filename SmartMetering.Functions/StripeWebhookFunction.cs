using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using SmartMetering.Application.Features.Payments.HandleWebhook;

namespace SmartMetering.Functions;

public class StripeWebhookFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<StripeWebhookFunction> _logger;

    public StripeWebhookFunction(
        IMediator mediator,
        ILogger<StripeWebhookFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [Function("StripeWebhook")]
    public async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "stripe-webhook")]
        HttpRequest req)
    {
        _logger.LogInformation("Processing Stripe webhook event.");

        using var reader = new StreamReader(req.Body);
        var payload = await reader.ReadToEndAsync();

        var signature = req.Headers["Stripe-Signature"].ToString();

        if (string.IsNullOrEmpty(signature))
        {
            _logger.LogWarning("Stripe webhook received without Stripe-Signature header.");
            return new BadRequestObjectResult(new { Message = "Missing Stripe-Signature header." });
        }

        var command = new HandleStripeWebhookCommand(payload, signature);
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            _logger.LogInformation("Stripe webhook processed successfully.");
            return new OkResult();
        }

        _logger.LogError(
            "Stripe webhook processing failed: {Code} - {Message}",
            result.Error!.Code, result.Error.Message);

        return new BadRequestObjectResult(new { result.Error.Code, result.Error.Message });
    }
}
