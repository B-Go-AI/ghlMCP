# GoHighLevel Express API Server

A clean, self-hosted Express TypeScript server for GoHighLevel contact management, designed for n8n integration and Railway deployment.

## Features
- Accepts POST requests from n8n at `/execute-agent`
- Authenticates using a GoHighLevel API key (header or env)
- Accepts a session key or contact identifier from n8n
- Uses a client map to route requests to the correct GHL subaccount
- Performs basic contact create/update API calls to GHL
- Returns a clean JSON response

## Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/CallBackCode/ghlMCP.git
   cd ghlMCP
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Set your GoHighLevel API key:**
   - Create a `.env` file in the project root:
     ```sh
     echo "GHL_API_KEY=your_api_key_here" > .env
     ```
   - (Optional) Add subaccount keys to the `clientMap` in `src/index.ts`.
4. **Build the project:**
   ```sh
   npm run build
   ```
5. **Run the server:**
   ```sh
   npm start
   ```

## Endpoint

### POST /execute-agent

**Request Body:**
```json
{
  "sessionKey": "string (optional)",
  "contactId": "string (optional)",
  "action": "create" | "update",
  "data": { ...contact fields... }
}
```
- `sessionKey` or `contactId` is required for client routing.
- `action` must be `create` or `update`.
- `data` must include `locationId` and, for updates, `id`.

**Headers:**
- `ghl-api-key` (optional): GHL API key for authentication (overrides env)

**Response:**
```json
{
  "success": true,
  "result": { ...contact object... }
}
```
Or, on error:
```json
{
  "error": "Error message"
}
```

## Project Structure
- `src/api/` — API wrappers for GoHighLevel endpoints
- `src/types/` — Centralized TypeScript types
- `src/index.ts` — Express server entry point

## Notes
- All requests require a valid GoHighLevel API key.
- Only contact create/update is supported.
- Designed for Railway and n8n integration.

---
Provided by CallBack
