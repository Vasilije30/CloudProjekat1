namespace SmartMetering.Application.Interfaces;

public interface IPaymentService
{
    Task<(string SessionId, string CheckoutUrl)> CreateCheckoutSessionAsync(
        Guid invoiceId,
        decimal amount,
        string description,
        string successUrl,
        string cancelUrl);

    /// <summary>
    /// Verifies the Stripe webhook signature and extracts payment completion data.
    /// Returns null if the event is not a checkout.session.completed event.
    /// </summary>
    Task<WebhookPaymentResult?> VerifyAndExtractPaymentAsync(string payload, string signature);
}

public record WebhookPaymentResult(string SessionId, string PaymentIntentId);

