# GHL API Server for n8n Integration

A clean, self-hosted Express TypeScript server that provides a unified API for GoHighLevel (GHL) contact management operations. Designed specifically for n8n workflow integration with support for multi-tenant client routing.

## Features

- 🚀 **Express Server**: Clean REST API with TypeScript
- 🔑 **Multi-Client Support**: Route requests to different GHL subaccounts
- 📧 **Session Key Routing**: Route by session key or contact identifier
- 🔄 **Contact Operations**: Create, update, get, list, delete, and upsert contacts
- ✅ **n8n Compatible**: Optimized for n8n webhook integration
- 🛡️ **Input Validation**: Zod schema validation for all requests
- 📊 **Health Monitoring**: Built-in health check endpoint
- 🎯 **Single Endpoint**: `/execute-agent` handles all operations

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

Create a `.env` file:

```env
GHL_API_KEY=your_ghl_api_key_here
GHL_LOCATION_ID=your_location_id_here
PORT=3000
```

### 3. Build and Start

```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Main Endpoint: `/execute-agent`

**POST** `/execute-agent`

This is the primary endpoint for all GHL contact operations.

#### Request Format

```json
{
  "action": "create|update|get|list|delete|upsert",
  "sessionKey": "optional_session_key",
  "contactIdentifier": "email@example.com|phone|contact_id",
  "clientId": "optional_client_id",
  "locationId": "optional_location_override",
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

#### Response Format

```json
{
  "success": true,
  "data": {
    "id": "contact_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  },
  "client": {
    "id": "default",
    "locationId": "location_id"
  },
  "action": "create",
  "contactId": "contact_id",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "responseTime": "150ms"
}
```

### Health Check

**GET** `/health`

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "clients": 1,
  "version": "1.1.1"
}
```

### Client Management

**POST** `/clients` - Add a new client
**GET** `/clients` - List all clients
**DELETE** `/clients/:clientId` - Remove a client

**POST** `/sessions` - Add session mapping

## Usage Examples

### 1. Create a Contact

```bash
curl -X POST http://localhost:3000/execute-agent \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "data": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    }
  }'
```

### 2. Update Contact by Email

```bash
curl -X POST http://localhost:3000/execute-agent \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update",
    "contactIdentifier": "john@example.com",
    "data": {
      "firstName": "Jane"
    }
  }'
```

### 3. Get Contact by ID

```bash
curl -X POST http://localhost:3000/execute-agent \
  -H "Content-Type: application/json" \
  -d '{
    "action": "get",
    "contactIdentifier": "contact_id_here"
  }'
```

### 4. List All Contacts

```bash
curl -X POST http://localhost:3000/execute-agent \
  -H "Content-Type: application/json" \
  -d '{
    "action": "list"
  }'
```

### 5. Upsert Contact (Create or Update)

```bash
curl -X POST http://localhost:3000/execute-agent \
  -H "Content-Type: application/json" \
  -d '{
    "action": "upsert",
    "data": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    }
  }'
```

## n8n Integration

### Webhook Configuration

1. Add an HTTP Request node in n8n
2. Set method to `POST`
3. Set URL to `http://your-server:3000/execute-agent`
4. Set Content-Type to `application/json`
5. Add your request body in the JSON format shown above

### Example n8n Workflow

```json
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "url": "http://localhost:3000/execute-agent",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "action",
              "value": "create"
            },
            {
              "name": "data",
              "value": "={{ { \"firstName\": $json.firstName, \"email\": $json.email } }}"
            }
          ]
        }
      },
      "name": "GHL Create Contact",
      "type": "n8n-nodes-base.httpRequest"
    }
  ]
}
```

## Multi-Client Configuration

### Add Additional Clients

```bash
curl -X POST http://localhost:3000/clients \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client2",
    "config": {
      "apiKey": "ghl_api_key_2",
      "locationId": "location_id_2",
      "name": "Client 2"
    }
  }'
```

### Route by Session Key

```bash
# Add session mapping
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "sessionKey": "session_123",
    "clientId": "client2",
    "contactId": "optional_contact_id"
  }'

# Use session key in request
curl -X POST http://localhost:3000/execute-agent \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "sessionKey": "session_123",
    "data": {
      "firstName": "John",
      "email": "john@example.com"
    }
  }'
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional error details",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "responseTime": "50ms"
}
```

Common error scenarios:
- **400**: Validation error or GHL API error
- **500**: Server error

## Development

### Run in Development Mode

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Build for Production

```bash
npm run build
```

## Railway Deployment

This server is optimized for Railway deployment. Set the following environment variables in Railway:

- `GHL_API_KEY`: Your GoHighLevel API key
- `GHL_LOCATION_ID`: Your GoHighLevel location ID
- `PORT`: Railway will set this automatically

## Architecture

- **Express Server**: Main HTTP server
- **ClientMap**: Routes requests to correct GHL subaccounts
- **ContactsMCP**: Handles GHL contact API operations
- **HighLevelApiClient**: Low-level GHL API client
- **Zod Validation**: Request/response validation

## License

ISC
