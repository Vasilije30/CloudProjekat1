using SmartMetering.Domain.Entities;

namespace SmartMetering.Application.Features.Billing;

public static class BillingCalculator
{
    public static BillingResult Calculate(
        decimal vtKwh,
        decimal ntKwh,
        TariffModel tariff,
        double approvedPowerKw)
    {
        // 1. Total consumption
        var eTotal = vtKwh + ntKwh;

        if (eTotal == 0m)
        {
            var powerChargeZero = tariff.PowerBillingRate * (decimal)approvedPowerKw;
            var supplierChargeZero = tariff.SupplierFee;
            return new BillingResult(
                GreenZoneKwh: 0m,
                BlueZoneKwh: 0m,
                RedZoneKwh: 0m,
                EnergyCharge: 0m,
                PowerCharge: powerChargeZero,
                SupplierCharge: supplierChargeZero,
                TotalAmount: powerChargeZero + supplierChargeZero);
        }

        // 2. Tariff coefficients
        var kVt = vtKwh / eTotal;
        var kNt = ntKwh / eTotal;

        // 3. Zone distribution using limits from TariffModel
        var greenZoneLimit = tariff.GreenZoneUpperLimit;
        var blueZoneLimit = tariff.BlueZoneUpperLimit;

        var greenTotal = Math.Min(eTotal, greenZoneLimit);
        var blueTotal = Math.Max(0m, Math.Min(eTotal - greenZoneLimit, blueZoneLimit - greenZoneLimit));
        var redTotal = Math.Max(0m, eTotal - blueZoneLimit);

        // 4. Per-zone VT/NT split
        var greenVt = greenTotal * kVt;
        var greenNt = greenTotal * kNt;
        var blueVt = blueTotal * kVt;
        var blueNt = blueTotal * kNt;
        var redVt = redTotal * kVt;
        var redNt = redTotal * kNt;

        // 5. Zone charges
        var greenCharge = (greenVt * tariff.GreenHighTariffPrice) + (greenNt * tariff.GreenLowTariffPrice);
        var blueCharge = (blueVt * tariff.BlueHighTariffPrice) + (blueNt * tariff.BlueLowTariffPrice);
        var redCharge = (redVt * tariff.RedHighTariffPrice) + (redNt * tariff.RedLowTariffPrice);

        var energyCharge = greenCharge + blueCharge + redCharge;

        // 6. Fixed costs
        var powerCharge = tariff.PowerBillingRate * (decimal)approvedPowerKw;
        var supplierCharge = tariff.SupplierFee;

        // 7. Total
        var totalAmount = energyCharge + powerCharge + supplierCharge;

        return new BillingResult(
            GreenZoneKwh: greenTotal,
            BlueZoneKwh: blueTotal,
            RedZoneKwh: redTotal,
            EnergyCharge: Math.Round(energyCharge, 2),
            PowerCharge: Math.Round(powerCharge, 2),
            SupplierCharge: Math.Round(supplierCharge, 2),
            TotalAmount: Math.Round(totalAmount, 2));
    }
}
