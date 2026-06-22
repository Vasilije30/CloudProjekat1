using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartMetering.Application.Interfaces;
using SmartMetering.Domain.Common;

namespace SmartMetering.Application.Features.Invoices.DownloadInvoiceDocument;

public class DownloadInvoiceDocumentQueryHandler
    : IRequestHandler<DownloadInvoiceDocumentQuery, Result<InvoiceDocumentResult>>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IStorageService _storageService;

    public DownloadInvoiceDocumentQueryHandler(
        IAppDbContext context,
        ICurrentUser currentUser,
        IStorageService storageService)
    {
        _context = context;
        _currentUser = currentUser;
        _storageService = storageService;
    }

    public async Task<Result<InvoiceDocumentResult>> Handle(
        DownloadInvoiceDocumentQuery request, CancellationToken cancellationToken)
    {
        var invoice = await _context.Invoices
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == request.InvoiceId, cancellationToken);

        if (invoice is null)
            return Result<InvoiceDocumentResult>.Failure(
                Error.NotFound("Invoices.NotFound", "Invoice not found."));

        if (invoice.UserId != _currentUser.UserId)
            return Result<InvoiceDocumentResult>.Failure(
                Error.Unauthorized("Invoices.Forbidden", "You do not own this invoice."));

        if (string.IsNullOrWhiteSpace(invoice.DocumentPath))
            return Result<InvoiceDocumentResult>.Failure(
                Error.NotFound("Invoices.NoDocument", "This invoice does not have a document."));

        var stream = await _storageService.DownloadBlobAsync("invoices", invoice.DocumentPath);

        using var memoryStream = new MemoryStream();
        await stream.CopyToAsync(memoryStream, cancellationToken);
        var content = memoryStream.ToArray();

        var contentType = invoice.DocumentPath.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase)
            ? "application/pdf"
            : "application/octet-stream";

        var fileName = $"invoice-{invoice.Year}-{invoice.Month:D2}-{invoice.Id:N}.pdf";

        return Result<InvoiceDocumentResult>.Success(
            new InvoiceDocumentResult(content, contentType, fileName));
    }
}
