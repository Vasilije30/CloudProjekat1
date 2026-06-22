namespace SmartMetering.Contracts.Payments;

public record CheckoutResponse(string SessionId, string CheckoutUrl);
