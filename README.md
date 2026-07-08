# Azure Environment Stability Dashboard

A React SPA hosted on **Azure Static Web Apps** that provides environment stability checks by aggregating data from:

- Azure Monitor Alerts
- Azure Monitor Logs (Log Analytics)
- Azure Activity Logs
- Azure Metrics
- Site24x7
- Azure Resource Health

All backend API calls use **Managed Identity** — no secrets or connection strings.

---

## Architecture

```
[React App (Azure Static Web Apps)]
         ↓ /api/* calls
[Azure Functions (Node.js)] ← Managed Identity
         ↓
[Storage Account + Log Analytics Workspace]
         ↑ ingested from
[Azure Monitor | Activity Logs | Alerts | Site24x7 Webhooks]
```

---

## Project Structure

```
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/        # Dashboard UI components
│   │   ├── hooks/             # React Query hooks
│   │   ├── services/          # API service layer
│   │   └── utils/             # Helpers & constants
├── api/                       # Azure Functions backend
│   ├── alerts/
│   ├── metrics/
│   ├── activityLogs/
│   ├── monitorLogs/
│   ├── resourceHealth/
│   └── site24Webhook/
├── infra/                     # Bicep IaC templates
│   ├── main.bicep
│   ├── storage.bicep
│   ├── functions.bicep
│   └── staticWebApp.bicep
├── .github/workflows/         # CI/CD pipelines
└── staticwebapp.config.json   # SWA routing config
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Azure CLI
- Azure Functions Core Tools v4
- An Azure subscription

### Local Development

```bash
# 1. Clone the repo
git clone https://github.com/ashokkondapuram/azure-environment-stability-dashboard
cd azure-environment-stability-dashboard

# 2. Install frontend deps
cd frontend && npm install

# 3. Install API deps
cd ../api && npm install

# 4. Run locally (SWA CLI bridges frontend + API)
npm install -g @azure/static-web-apps-cli
swa start frontend/build --api-location api
```

### Deploy to Azure

```bash
# Deploy infrastructure
cd infra
az deployment sub create --location canadacentral --template-file main.bicep

# Frontend builds + deploys via GitHub Actions automatically on push to main
```

---

## Managed Identity Setup

1. Enable System-Assigned Managed Identity on the Function App
2. Assign roles:
   - `Storage Blob Data Reader` on Storage Account
   - `Monitoring Reader` on subscription
   - `Log Analytics Reader` on Log Analytics Workspace
3. No connection strings needed — `DefaultAzureCredential` handles auth automatically

---

## Environment Variables

Set these in Azure Static Web Apps / Function App configuration:

| Variable | Description |
|---|---|
| `STORAGE_ACCOUNT_URL` | `https://<account>.blob.core.windows.net` |
| `LOG_ANALYTICS_WORKSPACE_ID` | Log Analytics Workspace ID |
| `SUBSCRIPTION_ID` | Azure Subscription ID |
| `RESOURCE_GROUP` | Primary resource group name |
