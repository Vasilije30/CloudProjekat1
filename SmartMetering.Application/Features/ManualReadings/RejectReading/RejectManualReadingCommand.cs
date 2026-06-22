using MediatR;
using SmartMetering.Domain.Common;

namespace SmartMetering.Application.Features.ManualReadings.RejectReading;

public record RejectManualReadingCommand(Guid ReadingId, string? Notes) : IRequest<Result>;
