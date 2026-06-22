using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartMetering.Application.Features.Payments.CreateCheckout;
using SmartMetering.Application.Features.Payments.HandleWebhook;
using SmartMetering.Contracts.Payments;

namespace SmartMetering.API.Controllers;

public class PaymentsController : BaseApiController
{
    private readonly IMediator _mediator;

    public PaymentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("checkout")]
    [Authorize(Roles = "Consumer")]
    public async Task<IActionResult> CreateCheckout([FromBody] CreateCheckoutRequest request)
    {
        var command = new CreateCheckoutCommand(request.InvoiceId);
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> HandleWebhook()
    {
        using var reader = new StreamReader(HttpContext.Request.Body);
        var payload = await reader.ReadToEndAsync();

        var signature = Request.Headers["Stripe-Signature"].ToString();

        if (string.IsNullOrEmpty(signature))
            return BadRequest(new { Code = "Webhook.MissingSignature", Message = "Stripe-Signature header is required." });

        var command = new HandleStripeWebhookCommand(payload, signature);
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }
}
