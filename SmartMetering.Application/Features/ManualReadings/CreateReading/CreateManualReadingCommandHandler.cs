using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartMetering.Application.Interfaces;
using SmartMetering.Contracts.ManualReadings;
using SmartMetering.Domain.Common;
using SmartMetering.Domain.Entities;

namespace SmartMetering.Application.Features.ManualReadings.CreateReading;

public class CreateManualReadingCommandHandler
    : IRequestHandler<CreateManualReadingCommand, Result<ManualReadingResponse>>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IStorageService _storageService;

    public CreateManualReadingCommandHandler(
        IAppDbContext context,
        ICurrentUser currentUser,
        IStorageService storageService)
    {
        _context = context;
        _currentUser = currentUser;
        _storageService = storageService;
    }

    public async Task<Result<ManualReadingResponse>> Handle(
        CreateManualReadingCommand request, CancellationToken cancellationToken)
    {
        var meter = await _context.Meters
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == request.MeterId, cancellationToken);

        if (meter is null)
            return Result<ManualReadingResponse>.Failure(
                Error.NotFound("ManualReading.MeterNotFound", "Meter not found."));

        // Verify the meter belongs to the current user via property
        var property = await _context.Properties
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == meter.PropertyId, cancellationToken);

        if (property is null || property.UserId != _currentUser.UserId)
            return Result<ManualReadingResponse>.Failure(
                Error.Unauthorized("ManualReading.NotOwner",
                    "You can only submit readings for your own meters."));

        // Generate a unique ID for the reading to use in blob path
        var readingId = Guid.NewGuid();
        var blobName = $"{readingId}/{request.ImageFileName}";

        var photoUrl = await _storageService.UploadBlobAsync(
            "manual-readings", blobName, request.ImageStream, request.ImageContentType);

        var readingResult = ManualReading.Create(
            request.MeterId,
            _currentUser.UserId,
            request.Reading,
            photoUrl);

        if (readingResult.IsFailure)
            return Result<ManualReadingResponse>.Failure(readingResult.Error!);

        var reading = readingResult.Value;

        _context.ManualReadings.Add(reading);
        await _context.SaveChangesAsync(cancellationToken);

        var response = new ManualReadingResponse(
            reading.Id,
            reading.MeterId,
            reading.UserId,
            reading.Reading,
            reading.PhotoUrl,
            reading.Status.ToString(),
            reading.CreatedAtUtc,
            reading.VerifiedAtUtc,
            reading.VerificationNotes);

        return Result<ManualReadingResponse>.Success(response);
    }
}
