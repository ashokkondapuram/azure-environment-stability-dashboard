# Role-Based Access Control (RBAC)

This application uses three roles enforced at two layers:
1. **Azure Static Web Apps** route rules in `staticwebapp.config.json`
2. **React frontend** via `AuthContext`, `RoleGuard`, and conditional rendering
3. **Azure Functions backend** via `x-ms-client-principal` header inspection

---

## Role Definitions

### 👁 Viewer (read-only)
Default role for all authenticated users.

**Can access:**
- Dashboard (stability score, environment cards)
- Alerts list (read-only, no acknowledge)
- Metrics charts
- Azure Activity Logs

**Cannot access:**
- KQL Log Query runner
- Alert acknowledgement
- Admin panel
- System configuration

---

### ✏️ Editor
Operational team members who actively respond to incidents.

**Can access (all Viewer access, plus):**
- KQL Monitor Logs query runner
- Acknowledge alerts
- View Grafana dashboard links

**Cannot access:**
- Admin panel
- User management
- System configuration

---

### 👑 Admin
Full access including user management and system configuration.

**Can access (all Editor access, plus):**
- Admin panel
- User role management (assign/change viewer → editor → admin)
- System configuration (Grafana URL, thresholds, notify email, refresh interval)
- Audit log

---

## Role Assignment

Roles are assigned via **Azure Static Web Apps role management** in the Azure Portal:

1. Go to your Static Web App in the Azure Portal.
2. Select **Role management**.
3. Invite users and assign the `admin`, `editor`, or `viewer` role.
4. Users authenticate via Microsoft Entra ID and receive their role via `/.auth/me`.

---

## Route Protection Matrix

| Route / API | Viewer | Editor | Admin |
|---|:---:|:---:|:---:|
| `GET /`                                | ✅ | ✅ | ✅ |
| `GET /alerts`                          | ✅ | ✅ | ✅ |
| `GET /metrics`                         | ✅ | ✅ | ✅ |
| `GET /activity`                        | ✅ | ✅ | ✅ |
| `GET /logs` (KQL runner)               | ❌ | ✅ | ✅ |
| `GET /admin`                           | ❌ | ❌ | ✅ |
| `GET /api/alerts`                      | ✅ | ✅ | ✅ |
| `POST /api/alerts/{id}/acknowledge`    | ❌ | ✅ | ✅ |
| `POST /api/monitorLogs` (KQL)          | ❌ | ✅ | ✅ |
| `GET /api/admin/users`                 | ❌ | ❌ | ✅ |
| `PATCH /api/admin/users/{id}`          | ❌ | ❌ | ✅ |
| `GET /api/admin/config`                | ❌ | ❌ | ✅ |
| `PUT /api/admin/config`                | ❌ | ❌ | ✅ |

---

## Role Hierarchy

```
admin  (level 3)  ⊃  editor  (level 2)  ⊃  viewer  (level 1)
```

Higher-level roles inherit all permissions of lower-level roles.

---

## Enforcement Layers

### Layer 1: Static Web Apps routing
Defined in `staticwebapp.config.json`. Azure evaluates this before any request hits the frontend or API.

### Layer 2: React AuthContext + RoleGuard
`<RoleGuard role="editor">` conditionally renders components. Navigation links are also filtered by role.

### Layer 3: Azure Functions
The `x-ms-client-principal` header (base64 JWT injected by SWA) is decoded and role-checked in `admin/index.js` and `acknowledgeAlert/index.js` before any data operation.

---

## Local Development Note

The `/.auth/me` endpoint is not available locally. Use the SWA CLI which emulates it:

```bash
swa start frontend/build --api-location api --devserver-timeout 90
```

Or mock the auth context for local development by setting a `REACT_APP_MOCK_ROLE` env variable.
