using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartMetering.Application.Interfaces;
using SmartMetering.Contracts.ManualReadings;
using SmartMetering.Domain.Common;
using SmartMetering.Domain.Enums;

namespace SmartMetering.Application.Features.ManualReadings.GetReadings;

public class GetManualReadingsQueryHandler
    : IRequestHandler<GetManualReadingsQuery, Result<List<ManualReadingResponse>>>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetManualReadingsQueryHandler(IAppDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<ManualReadingResponse>>> Handle(
        GetManualReadingsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.ManualReadings.AsNoTracking();

        // Consumer sees only their own readings; Admin/BillingAdmin sees all
        if (_currentUser.Role == UserRole.Consumer)
        {
            query = query.Where(r => r.UserId == _currentUser.UserId);
        }

        var readings = await query
            .OrderByDescending(r => r.CreatedAtUtc)
            .Select(r => new ManualReadingResponse(
                r.Id,
                r.MeterId,
                r.UserId,
                r.Reading,
                r.PhotoUrl,
                r.Status.ToString(),
                r.CreatedAtUtc,
                r.VerifiedAtUtc,
                r.VerificationNotes))
            .ToListAsync(cancellationToken);

        return Result<List<ManualReadingResponse>>.Success(readings);
    }
}
