namespace SmartMetering.Contracts.ManualReadings;

public record CreateManualReadingRequest(Guid MeterId, double Reading);
