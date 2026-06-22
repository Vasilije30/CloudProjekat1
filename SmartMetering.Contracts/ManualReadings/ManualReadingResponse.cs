namespace SmartMetering.Contracts.ManualReadings;

public record ManualReadingResponse(
    Guid Id,
    Guid MeterId,
    Guid UserId,
    double Reading,
    string PhotoUrl,
    string Status,
    DateTime CreatedAtUtc,
    DateTime? VerifiedAtUtc,
    string? VerificationNotes);
