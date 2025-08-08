# Simple GHL API Server

A clean, simple GoHighLevel API server built with TypeScript and Express.

## Features

- ✅ Simple contact management (create, search, update)
- ✅ SMS sending
- ✅ OAuth2 authentication (like n8n)
- ✅ Clean, minimal codebase (~200 lines)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
```bash
GHL_CLIENT_ID=your_client_id
GHL_CLIENT_SECRET=your_client_secret
GHL_ACCESS_TOKEN=your_access_token
GHL_REFRESH_TOKEN=your_refresh_token
GHL_LOCATION_ID=your_location_id
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Contacts
```
POST /contacts          # Create contact
GET  /contacts          # Search contacts
PUT  /contacts/:id      # Update contact
```

### SMS
```
POST /sms              # Send SMS
```

## Example Usage

### Create Contact
```bash
curl -X POST http://localhost:3000/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Smith"
  }'
```

### Send SMS
```bash
curl -X POST http://localhost:3000/sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "message": "Hello from the API!"
  }'
```

## Project Structure

```
src/
├── index.ts           # Main server
├── ghl-client.ts      # GHL API client
└── routes/
    └── contacts.ts    # Contact routes
```

## Deployment

This server is designed to run on Railway. The `railway.json` and `railway-start.js` files handle deployment configuration.
