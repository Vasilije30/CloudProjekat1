using MediatR;
using SmartMetering.Contracts.ManualReadings;
using SmartMetering.Domain.Common;

namespace SmartMetering.Application.Features.ManualReadings.GetReadings;

public record GetManualReadingsQuery() : IRequest<Result<List<ManualReadingResponse>>>;
