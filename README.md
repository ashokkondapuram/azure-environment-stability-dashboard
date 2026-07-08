# Azure Environment Stability Dashboard

A React SPA hosted on **Azure Static Web Apps** that provides environment stability checks by aggregating data from:

- Azure Monitor Alerts
- Azure Monitor Logs (Log Analytics Workspace)
- Azure Activity Logs
- Azure Metrics
- Site24x7
- Azure Resource Health
- Grafana dashboards for metrics and logs visualization

All backend API calls use **Managed Identity** where supported, so you can avoid storing secrets or connection strings in application code.

---

## Architecture

```text
[React App (Azure Static Web Apps)]
         ↓ /api/* calls
[Azure Functions (Node.js)] ← Managed Identity
         ↓
[Azure Storage + Log Analytics Workspace + Azure Monitor]
         ↑ ingested from
[Azure Alerts | Activity Logs | Metrics | Site24x7 | Resource Health]

[Azure Managed Grafana]
         ↓ queries
[Azure Monitor Metrics + Azure Monitor Logs / Log Analytics Workspace]
```

This design gives you two views of the same operational data:

1. **Application dashboard** in React for environment stability scoring and operational summaries.
2. **Grafana dashboards** for deeper drill-down into logs, metrics, and time-series visualization.

---

## Core Capabilities

### React Dashboard
- Environment health cards for Production, Staging, and Development.
- Stability score based on alerts, warnings, degraded resources, and metric threshold breaches.
- Alert feed from Azure Monitor and Site24x7.
- Azure Activity Log timeline.
- KQL query runner for Log Analytics Workspace.

### Grafana Integration
- Azure Monitor as a Grafana data source for **metrics** and **logs**.
- Log Analytics Workspace queries from Grafana panels.
- Azure Monitor metrics charts for App Service, SQL, VMs, AKS, and other Azure resources.
- Optional shared operational model where React is used for summaries and Grafana is used for investigations.

---

## Project Structure

```text
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

## Azure Services Used

- Azure Static Web Apps for React hosting.
- Azure Functions for backend APIs.
- Azure Storage Account for persisted alert and integration payloads.
- Azure Monitor for alerts and metrics.
- Log Analytics Workspace for KQL-based log queries.
- Azure Resource Health for service availability state.
- Azure Managed Grafana for operational dashboards.

---

## Getting Started

### Prerequisites
- Node.js 18+
- Azure CLI
- Azure Functions Core Tools v4
- An Azure subscription
- Grafana access, preferably **Azure Managed Grafana** in the same tenant or subscription boundary

### Local Development

```bash
# 1. Clone the repo
git clone https://github.com/ashokkondapuram/azure-environment-stability-dashboard
cd azure-environment-stability-dashboard

# 2. Install frontend dependencies
cd frontend && npm install

# 3. Install API dependencies
cd ../api && npm install

# 4. Start the Static Web Apps local experience
npm install -g @azure/static-web-apps-cli
swa start frontend/build --api-location api
```

### Deploy to Azure

```bash
cd infra
az deployment sub create \
  --location canadacentral \
  --template-file main.bicep
```

After infrastructure deployment, pushes to `main` can deploy the frontend through GitHub Actions after you add the Static Web Apps deployment token as a repository secret.

---

## Managed Identity Setup

### Function App Identity
1. Enable **System-Assigned Managed Identity** on the Azure Function App.
2. Assign the following roles:
   - `Storage Blob Data Reader` on the Storage Account
   - `Monitoring Reader` on the subscription or resource group
   - `Log Analytics Reader` on the Log Analytics Workspace
3. Use `DefaultAzureCredential` in the Azure Functions code.

### Why Managed Identity Here
- The Function App can securely read Azure Storage, Azure Monitor, and Log Analytics without embedded secrets.
- Local development can fall back to Azure CLI authentication.

---

## Grafana Integration

Grafana should query Azure operational data directly while the React app continues to provide environment stability workflows.

### Option 1: Azure Managed Grafana (Recommended)
Use **Azure Managed Grafana** and connect it to Azure Monitor as the main data source.

This gives you access to:
- Azure Monitor Metrics
- Azure Monitor Logs
- Log Analytics Workspace queries
- Resource-level dashboards across subscriptions and resource groups

### Option 2: Self-Hosted Grafana
If you use self-hosted Grafana, configure the Azure Monitor data source and authenticate using Microsoft Entra ID or another supported secure method.

---

## Grafana Setup Steps

### 1. Provision Grafana
Create an **Azure Managed Grafana** instance in the same Azure environment where possible.

### 2. Grant Access
Grant Grafana access to the required Azure data sources:
- Reader or Monitoring Reader on the target subscription/resource group
- Log Analytics Reader on the Log Analytics Workspace

### 3. Add Azure Monitor Data Source
Inside Grafana:
1. Go to **Connections** or **Data Sources**.
2. Add **Azure Monitor**.
3. Configure access to:
   - Subscription
   - Resource group scope if needed
   - Log Analytics Workspace
4. Validate access.

### 4. Build Dashboards
Recommended Grafana dashboards:
- CPU, memory, request rate, and latency by environment.
- Failed requests and dependency failures.
- Azure Activity trends.
- KQL-based log volume panels.
- Alert trends by severity and source.

---

## Recommended Dashboard Split

Use this model to keep responsibilities clear:

| Layer | Purpose |
|---|---|
| React app | Environment stability score, summaries, action-oriented views |
| Azure Functions | Secure API layer using managed identity |
| Grafana | Deep log and metric exploration, trend dashboards |
| Log Analytics Workspace | Central log store for KQL queries |
| Azure Monitor | Native alerts, metrics, activity data |

---

## Example Grafana Use Cases

### Metrics Panels
Use Grafana to visualize:
- App Service CPU percentage
- Memory pressure
- HTTP 5xx trends
- Database DTU or CPU consumption
- VM heartbeat or disk latency

### Logs Panels
Use Grafana with Azure Monitor Logs / Log Analytics Workspace for:
- Exception counts over time
- Failed requests by operation name
- Slow endpoints
- Site24x7 incident correlation with Azure platform events

### Sample KQL Queries

#### Failed requests in the last hour
```kusto
AppRequests
| where TimeGenerated > ago(1h)
| where Success == false
| summarize FailedRequests = count() by bin(TimeGenerated, 5m)
| order by TimeGenerated asc
```

#### Exceptions by type
```kusto
AppExceptions
| where TimeGenerated > ago(24h)
| summarize Count = count() by type
| order by Count desc
```

#### Activity volume by operation
```kusto
AzureActivity
| where TimeGenerated > ago(24h)
| summarize Count = count() by OperationNameValue
| order by Count desc
```

---

## Application Configuration

Set these in Azure Static Web Apps and Function App settings as needed.

| Variable | Description |
|---|---|
| `STORAGE_ACCOUNT_URL` | `https://<account>.blob.core.windows.net` |
| `LOG_ANALYTICS_WORKSPACE_ID` | Log Analytics Workspace ID |
| `SUBSCRIPTION_ID` | Azure Subscription ID |
| `RESOURCE_GROUP` | Primary resource group name |
| `GRAFANA_URL` | URL of Azure Managed Grafana or self-hosted Grafana |
| `GRAFANA_DASHBOARD_OVERVIEW_URL` | Optional overview dashboard deep link |
| `GRAFANA_DASHBOARD_LOGS_URL` | Optional logs dashboard deep link |
| `GRAFANA_DASHBOARD_METRICS_URL` | Optional metrics dashboard deep link |

You can optionally surface Grafana links in the React dashboard so users can jump from summary cards into detailed dashboards.

---

## Recommended Enhancements

- Add a **Grafana Links** widget to the React dashboard.
- Add environment filters such as Production, Staging, UAT, and DR.
- Store alert normalization rules in a shared utility module.
- Add scheduled Functions to pull periodic health snapshots into Blob Storage.
- Add role-based access using Microsoft Entra ID groups.

---

## Security Guidance

- Do not store Storage Account keys or Log Analytics shared keys in code.
- Prefer Managed Identity for Azure Functions and Azure-native services.
- Restrict Grafana access with Entra ID groups and least-privilege RBAC.
- Protect `/api/*` routes using authenticated access in Static Web Apps.
- Keep `local.settings.json` out of source control.

---

## Operations Workflow

A practical operating model for your team:

1. Azure Monitor, Activity Logs, Metrics, and Site24x7 generate operational data.
2. Azure Functions normalize and expose summary APIs.
3. React shows environment stability checks and fast summaries.
4. Grafana is used for drill-down into metrics and logs.
5. Log Analytics Workspace remains the shared query layer for advanced investigations.

---

## Future Work

Suggested next updates for this repository:
- Add Bicep for Azure Managed Grafana.
- Add frontend components for Grafana dashboard deep links.
- Add scheduled ingestion for summary snapshots.
- Add support for more environments such as UAT and DR.
- Add dashboards for cost, availability, and deployment correlation.
