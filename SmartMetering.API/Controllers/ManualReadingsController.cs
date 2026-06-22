using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartMetering.Application.Features.ManualReadings.ApproveReading;
using SmartMetering.Application.Features.ManualReadings.CreateReading;
using SmartMetering.Application.Features.ManualReadings.GetReadings;
using SmartMetering.Application.Features.ManualReadings.RejectReading;

namespace SmartMetering.API.Controllers;

[Authorize]
public class ManualReadingsController : BaseApiController
{
    private readonly IMediator _mediator;

    public ManualReadingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("/api/meters/{meterId:guid}/manual-reading")]
    [Authorize(Roles = "Consumer")]
    public async Task<IActionResult> Create(
        Guid meterId,
        [FromForm] double reading,
        IFormFile image)
    {
        if (image is null || image.Length == 0)
            return BadRequest(new { Code = "ManualReading.NoImage", Message = "Photo of meter display is required." });

        using var stream = image.OpenReadStream();

        var command = new CreateManualReadingCommand(
            meterId,
            reading,
            stream,
            image.FileName,
            image.ContentType);

        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var query = new GetManualReadingsQuery();
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    [HttpPatch("{id:guid}/approve")]
    [Authorize(Roles = "BillingAdmin,Admin")]
    public async Task<IActionResult> Approve(Guid id, [FromBody] ApproveRejectRequest? request)
    {
        var command = new ApproveManualReadingCommand(id, request?.Notes);
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    [HttpPatch("{id:guid}/reject")]
    [Authorize(Roles = "BillingAdmin,Admin")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] ApproveRejectRequest? request)
    {
        var command = new RejectManualReadingCommand(id, request?.Notes);
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }
}

public record ApproveRejectRequest(string? Notes);
