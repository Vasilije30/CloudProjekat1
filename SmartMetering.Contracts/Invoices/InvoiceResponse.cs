namespace SmartMetering.Contracts.Invoices;

public record InvoiceResponse(
    Guid Id,
    Guid PropertyId,
    Guid MeterId,
    int Month,
    int Year,
    decimal HighTariffKwh,
    decimal LowTariffKwh,
    decimal TotalKwh,
    decimal GreenZoneKwh,
    decimal BlueZoneKwh,
    decimal RedZoneKwh,
    decimal EnergyCharge,
    decimal PowerCharge,
    decimal SupplierCharge,
    decimal TotalAmount,
    string Status,
    DateTime? PaidAtUtc,
    bool HasDocument,
    DateTime CreatedAtUtc);
