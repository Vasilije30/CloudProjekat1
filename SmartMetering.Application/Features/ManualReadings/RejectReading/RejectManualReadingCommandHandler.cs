using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartMetering.Application.Interfaces;
using SmartMetering.Domain.Common;

namespace SmartMetering.Application.Features.ManualReadings.RejectReading;

public class RejectManualReadingCommandHandler
    : IRequestHandler<RejectManualReadingCommand, Result>
{
    private readonly IAppDbContext _context;

    public RejectManualReadingCommandHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(
        RejectManualReadingCommand request, CancellationToken cancellationToken)
    {
        var reading = await _context.ManualReadings
            .FirstOrDefaultAsync(r => r.Id == request.ReadingId, cancellationToken);

        if (reading is null)
            return Result.Failure(
                Error.NotFound("ManualReading.NotFound", "Manual reading not found."));

        reading.Reject(request.Notes);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
