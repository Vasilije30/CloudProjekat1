using MediatR;
using SmartMetering.Domain.Common;

namespace SmartMetering.Application.Features.ManualReadings.ApproveReading;

public record ApproveManualReadingCommand(Guid ReadingId, string? Notes) : IRequest<Result>;
