using MediatR;
using SmartMetering.Contracts.ManualReadings;
using SmartMetering.Domain.Common;

namespace SmartMetering.Application.Features.ManualReadings.CreateReading;

public record CreateManualReadingCommand(
    Guid MeterId,
    double Reading,
    Stream ImageStream,
    string ImageFileName,
    string ImageContentType) : IRequest<Result<ManualReadingResponse>>;
