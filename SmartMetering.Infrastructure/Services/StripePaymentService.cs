using Microsoft.Extensions.Options;
using SmartMetering.Application.Interfaces;
using SmartMetering.Infrastructure.Settings;
using Stripe;
using Stripe.Checkout;

namespace SmartMetering.Infrastructure.Services;

public class StripePaymentService : IPaymentService
{
    private readonly StripeSettings _settings;

    public StripePaymentService(IOptions<StripeSettings> settings)
    {
        _settings = settings.Value;
        StripeConfiguration.ApiKey = _settings.SecretKey;
    }

    public async Task<(string SessionId, string CheckoutUrl)> CreateCheckoutSessionAsync(
        Guid invoiceId,
        decimal amount,
        string description,
        string successUrl,
        string cancelUrl)
    {
        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = new List<SessionLineItemOptions>
            {
                new()
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = "rsd",
                        UnitAmount = (long)(amount * 100),
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = description
                        }
                    },
                    Quantity = 1
                }
            },
            Mode = "payment",
            SuccessUrl = successUrl,
            CancelUrl = cancelUrl,
            Metadata = new Dictionary<string, string>
            {
                { "invoiceId", invoiceId.ToString() }
            }
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options);

        return (session.Id, session.Url);
    }

    public Task<WebhookPaymentResult?> VerifyAndExtractPaymentAsync(string payload, string signature)
    {
        var stripeEvent = EventUtility.ConstructEvent(
            payload, signature, _settings.WebhookSecret);

        if (stripeEvent.Type != EventTypes.CheckoutSessionCompleted)
            return Task.FromResult<WebhookPaymentResult?>(null);

        var session = stripeEvent.Data.Object as Session;
        if (session is null)
            return Task.FromResult<WebhookPaymentResult?>(null);

        var result = new WebhookPaymentResult(session.Id, session.PaymentIntentId);
        return Task.FromResult<WebhookPaymentResult?>(result);
    }
}
