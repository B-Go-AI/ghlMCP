# 🔄 N8N WORKFLOW REBUILD GUIDE

## **🎯 THE PLAN: Rebuild Your Entire n8n Workflow**

Instead of trying to make the complex workflow work, let's rebuild it with our simple, working API endpoints.

## **📋 STEP-BY-STEP REBUILD PROCESS**

### **STEP 1: Delete Current Workflow**
1. Go to your n8n instance: `https://primary-production-1ca15.up.railway.app`
2. Open the current workflow
3. **Delete all nodes** (keep the canvas clean)

### **STEP 2: Create New Simple Nodes**

#### **Node 1: Webhook Trigger**
- **Type**: Webhook
- **Name**: "Webhook Trigger"
- **HTTP Method**: POST
- **Path**: `/ghl-action`
- **Response Mode**: "Respond to Webhook"

#### **Node 2: Action Router**
- **Type**: IF
- **Name**: "Action Router"
- **Conditions**:
  - `{{ $json.action }}` equals `create` → Create Contact
  - `{{ $json.action }}` equals `search` → Search Contacts  
  - `{{ $json.action }}` equals `update` → Update Contact
  - `{{ $json.action }}` equals `sms` → Send SMS

#### **Node 3: Create Contact**
- **Type**: HTTP Request
- **Name**: "Create Contact"
- **Method**: POST
- **URL**: `https://ghlmcp-production.up.railway.app/contacts`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "{{ $json.email }}",
  "firstName": "{{ $json.firstName }}",
  "lastName": "{{ $json.lastName }}",
  "phone": "{{ $json.phone }}"
}
```

#### **Node 4: Search Contacts**
- **Type**: HTTP Request
- **Name**: "Search Contacts"
- **Method**: GET
- **URL**: `https://ghlmcp-production.up.railway.app/contacts?email={{ $json.email }}`
- **Headers**: `Content-Type: application/json`

#### **Node 5: Update Contact**
- **Type**: HTTP Request
- **Name**: "Update Contact"
- **Method**: PUT
- **URL**: `https://ghlmcp-production.up.railway.app/contacts/{{ $json.contactId }}`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "firstName": "{{ $json.firstName }}",
  "lastName": "{{ $json.lastName }}",
  "email": "{{ $json.email }}"
}
```

#### **Node 6: Send SMS**
- **Type**: HTTP Request
- **Name**: "Send SMS"
- **Method**: POST
- **URL**: `https://ghlmcp-production.up.railway.app/sms`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "phone": "{{ $json.phone }}",
  "message": "{{ $json.message }}"
}
```

#### **Node 7: Response**
- **Type**: Respond to Webhook
- **Name**: "Response"
- **Response Code**: 200
- **Response Body**: `{{ $json }}`

## **🔗 CONNECTIONS**

```
Webhook Trigger → Action Router
Action Router → Create Contact (if action = create)
Action Router → Search Contacts (if action = search)
Action Router → Update Contact (if action = update)
Action Router → Send SMS (if action = sms)
Create Contact → Response
Search Contacts → Response
Update Contact → Response
Send SMS → Response
```

## **🧪 TESTING**

### **Test Create Contact**
```bash
curl -X POST https://primary-production-1ca15.up.railway.app/webhook/ghl-action \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "phone": "+1234567890"
  }'
```

### **Test Search Contacts**
```bash
curl -X POST https://primary-production-1ca15.up.railway.app/webhook/ghl-action \
  -H "Content-Type: application/json" \
  -d '{
    "action": "search",
    "email": "test@example.com"
  }'
```

### **Test Send SMS**
```bash
curl -X POST https://primary-production-1ca15.up.railway.app/webhook/ghl-action \
  -H "Content-Type: application/json" \
  -d '{
    "action": "sms",
    "phone": "+1234567890",
    "message": "Hello from n8n!"
  }'
```

## **🔧 ENVIRONMENT VARIABLES**

Make sure your Railway "GHL MCP" project has these variables:
```
GHL_CLIENT_ID=68502d2fa96710afbdc97eeb-mbz7zc8a
GHL_CLIENT_SECRET=your_client_secret_here
GHL_ACCESS_TOKEN=your_access_token_here
GHL_REFRESH_TOKEN=your_refresh_token_here
GHL_LOCATION_ID=gMgcCQOGXIn1DK6lCDa7
```

## **✅ BENEFITS OF THIS APPROACH**

1. **Simple & Clean**: No complex MCP protocol
2. **Direct API Calls**: Straight to GHL API
3. **Easy Debugging**: Clear request/response flow
4. **Reliable**: No complex parsing or routing
5. **Maintainable**: Easy to understand and modify

## **🚀 DEPLOYMENT**

1. Build the workflow in n8n
2. Test each endpoint individually
3. Activate the workflow
4. Use the webhook URL for external triggers

**This approach will give you a working, reliable system that's easy to maintain and debug!**
