using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using SmartMetering.Application.Features.Billing.GenerateInvoices;

namespace SmartMetering.Functions;

public class GenerateMonthlyInvoicesFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<GenerateMonthlyInvoicesFunction> _logger;

    public GenerateMonthlyInvoicesFunction(
        IMediator mediator,
        ILogger<GenerateMonthlyInvoicesFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [Function("GenerateMonthlyInvoices")]
    public async Task Run(
        [TimerTrigger("0 0 0 1 * *")] TimerInfo timerInfo)
    {
        // Calculate previous month
        var now = DateTime.UtcNow;
        var previousMonth = now.AddMonths(-1);
        var month = previousMonth.Month;
        var year = previousMonth.Year;

        _logger.LogInformation(
            "Starting monthly invoice generation for {Month:D2}/{Year}.",
            month, year);

        var command = new GenerateInvoicesCommand(month, year);
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            _logger.LogInformation(
                "Monthly invoice generation completed: {Message}",
                result.Value.Message);
        }
        else
        {
            _logger.LogError(
                "Monthly invoice generation failed: {Code} - {Message}",
                result.Error!.Code, result.Error.Message);
        }
    }
}
