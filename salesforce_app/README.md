# Salesforce SOQL Demo

This project boots a Vite + React frontend and an Express server that proxies Salesforce API requests so you can experiment with SOQL queries locally.

## Prerequisites

- Salesforce Connected App with OAuth enabled and `Perform requests on your behalf at any time (refresh_token, offline_access)` scope.
- Refresh token issued for your user.
- Node.js 18+ / pnpm.

## Environment Setup

Copy `env.example` to `.env` and fill in the values from your Salesforce org:

```
SALESFORCE_CLIENT_ID=""
SALESFORCE_CLIENT_SECRET=""
SALESFORCE_REFRESH_TOKEN=""
SALESFORCE_LOGIN_URL="https://login.salesforce.com" # or https://test.salesforce.com for sandboxes
SALESFORCE_API_VERSION="61.0"
SERVER_PORT="5174"
VITE_API_BASE_URL="http://localhost:5174"
```

> The server uses the refresh token to request short-lived access tokens. Credentials never reach the browser; the frontend only talks to the local Express proxy.

## Running Locally

```bash
pnpm install
pnpm dev
```

The command runs both the Vite dev server (`http://localhost:5173`) and the Express API (`http://localhost:5174`).

Health check:

```bash
curl http://localhost:5174/health
```

Verify Salesforce connectivity after adding credentials:

```bash
curl http://localhost:5174/api/salesforce/accounts
```

## Frontend Usage

The dashboard includes a **Salesforce Query Tester** card. Enter any SOQL statement or click **Run Sample Query** (it uses `SELECT Id, Name, Type FROM Account LIMIT 10`). Results render in a responsive table with basic error messaging.

## Project Structure Highlights

- `server/index.ts` – Express bootstrap, CORS, routing, error handling.
- `server/routes/salesforce.ts` – `/api/salesforce/query` and sample `/accounts` endpoint.
- `server/salesforce/client.ts` – handles token refresh and SOQL execution via REST API.
- `src/components/salesforce-query.tsx` – UI for running queries and displaying results.
- `src/lib/api.ts` – lightweight fetch wrapper that targets the proxy base URL.

## Next Steps

- Implement OAuth authorization code flow to mint refresh tokens from the app itself if needed.
- Add caching or pagination for large query result sets.
- Guard the API with session auth once deploying beyond local development.
