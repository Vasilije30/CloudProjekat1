# Smart Metering Cloud Platform

A cloud-based platform for monitoring utility meters. Meters (or the included simulator) send readings to Azure Functions, readings are processed through a queue, stored, checked for problems, and streamed live to a React dashboard. The platform also handles billing: monthly PDF invoices and online payments with Stripe.

## Features

**Consumers**
- Register properties and meters
- Live consumption dashboard (real-time updates via SignalR)
- Submit manual meter readings
- View invoices and pay them online (Stripe)
- Receive alerts

**Admins and billing admins**
- Manage user accounts and tariff models
- Review meters and manual readings
- View invoices and alerts across all accounts

**Background jobs (Azure Functions)**
- Receive and process meter telemetry
- Detect low voltage (below 190 V) and create critical alerts
- Detect offline meters (no readings for 3 minutes) every 30 seconds
- Generate monthly invoices (PDF) on the 1st of each month
- Handle Stripe payment webhooks

Access is role-based (Admin, Billing admin, Consumer) and secured with JWT.

## Architecture

```
Meter / Simulator
      │  POST /api/telemetry  (device ID + device token)
      ▼
Azure Function: ReceiveTelemetry ── validates the device ──► Storage Queue (telemetry-queue)
                                                                  │
                                                                  ▼
                                              Azure Function: ProcessTelemetry
                                   ┌────────────────┼─────────────────────────┐
                                   ▼                ▼                         ▼
                           Table Storage       SQL Server              API (SignalR hub)
                          (readings)      (meter state, alerts)               │
                                                                              ▼
                                                                      React dashboard
```

The solution uses a layered (Clean Architecture) structure with CQRS through MediatR:

| Project | Responsibility |
|---|---|
| `SmartMetering.Domain` | Entities, enums, domain rules |
| `SmartMetering.Application` | Use cases (commands, queries, validators), interfaces |
| `SmartMetering.Infrastructure` | EF Core, Azure Storage, Stripe, SendGrid, JWT, PDF generation |
| `SmartMetering.Contracts` | Request and response models shared with clients |
| `SmartMetering.API` | ASP.NET Core Web API and SignalR hub |
| `SmartMetering.Functions` | Azure Functions (telemetry, timers, Stripe webhook) |
| `SmartMetering.Simulator` | Console app that simulates a meter |
| `SmartMetering.Web` | React web client |

## Tech stack

- **Backend:** C#, .NET 8, ASP.NET Core Web API, Entity Framework Core, MediatR, FluentValidation, JWT, SignalR
- **Cloud:** Azure Functions (isolated worker), Azure Storage (Queues, Tables, Blobs)
- **Database:** SQL Server
- **Integrations:** Stripe (payments), SendGrid (email)
- **Frontend:** React, TypeScript, Vite, Recharts

## Getting started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) 18 or newer
- SQL Server (LocalDB works, which is the default in the config)
- [Azurite](https://learn.microsoft.com/azure/storage/common/storage-use-azurite) (local Azure Storage emulator)
- [Azure Functions Core Tools](https://learn.microsoft.com/azure/azure-functions/functions-run-local) v4

### Configuration
Settings are in `SmartMetering.API/appsettings.json`, `SmartMetering.API/appsettings.Development.json` and `SmartMetering.Functions/local.settings.json`. Set your own values for:

- `ConnectionStrings:DefaultConnection` (SQL Server) and `ConnectionStrings:AzureStorage` (Azurite by default)
- `Jwt:Key` (use the same key in the API and the Functions project)
- `Broadcast:SharedSecret` (same value in the API and the Functions project)
- `Stripe:SecretKey` and `Stripe:WebhookSecret` (a Stripe account in test mode is enough)
- `SendGrid:ApiKey` (optional for local development)

Never commit real keys to the repository.

### Run
Start each part in its own terminal:

```bash
# 1. Storage emulator
azurite

# 2. API (http://localhost:5080)
cd SmartMetering.API
dotnet run

# 3. Azure Functions (http://localhost:7071)
cd SmartMetering.Functions
func start

# 4. Web client (http://localhost:5173)
cd SmartMetering.Web
npm install
npm run dev
```

In Development, the API applies database migrations on startup and creates a default admin account (email `admin@smartmetering.local`, password from `Seed:AdminPassword` in `appsettings.Development.json`).

The web client talks to the API at `http://localhost:5080` by default. To change it, set `VITE_API_BASE_URL` in `SmartMetering.Web/.env.local`.

### Simulate a meter
1. Sign in to the web client and register a meter (note its serial number).
2. Register a device for that meter:
   ```
   POST http://localhost:5080/api/meters/register-device
   { "deviceId": "my-device-1", "serialNumber": "<serial number>" }
   ```
   The response contains a `deviceAccessToken`.
3. Put the device ID and token into `SmartMetering.Simulator/appsettings.json`:
   ```json
   "Simulator": {
     "ApiBaseUrl": "http://localhost:7071",
     "DeviceId": "my-device-1",
     "DeviceToken": "<deviceAccessToken>",
     "IntervalSeconds": 5
   }
   ```
4. Run the simulator:
   ```bash
   cd SmartMetering.Simulator
   dotnet run
   ```
   It sends a reading (voltage, current, power factor, load, total kWh) every few seconds, and the values appear live on the consumer dashboard.
