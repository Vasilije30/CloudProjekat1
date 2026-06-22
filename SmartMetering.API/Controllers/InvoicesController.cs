using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartMetering.Application.Features.Invoices.DownloadInvoiceDocument;
using SmartMetering.Application.Features.Invoices.GetConsumerInvoices;
using SmartMetering.Application.Features.Invoices.GetInvoiceById;

namespace SmartMetering.API.Controllers;

[Authorize(Roles = "Consumer")]
public class InvoicesController : BaseApiController
{
    private readonly IMediator _mediator;

    public InvoicesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? propertyId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = new GetConsumerInvoicesQuery(propertyId, page, pageSize);
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var query = new GetInvoiceByIdQuery(id);
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    [HttpGet("{id:guid}/document")]
    public async Task<IActionResult> DownloadDocument(Guid id)
    {
        var query = new DownloadInvoiceDocumentQuery(id);
        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return HandleResult(result);

        var doc = result.Value;
        return File(doc.Content, doc.ContentType, doc.FileName);
    }
}
