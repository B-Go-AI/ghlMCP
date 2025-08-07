# Railway Deployment Debug Guide

## 🚨 404 Error on `/execute-agent` - Troubleshooting Steps

### 1. **Verify Route Registration**
The `/execute-agent` route should be registered in `src/index.ts`:

```typescript
// Agent execution endpoint for AI agents (GHL MCP standard)
app.post('/execute-agent', executeAgentHandler);
console.log('✅ /execute-agent route registered');
```

### 2. **Check Railway Configuration**
Ensure `railway.toml` is configured correctly:

```toml
[[routes]]
src = "/execute-agent"
dest = "/execute-agent"
```

### 3. **Verify Build Process**
Run these commands locally to ensure everything compiles:

```bash
npm run build
npm test
```

### 4. **Check Railway Logs**
In Railway dashboard, check the deployment logs for:
- ✅ Route registration confirmation
- ❌ Any compilation errors
- ❌ Missing dependencies

### 5. **Test Endpoint Locally**
Use the test script to verify local functionality:

```bash
node test-endpoint.js
```

### 6. **Common Issues & Solutions**

#### Issue: Route not found (404)
**Solution:** 
- Verify route is registered before 404 handler
- Check that `executeAgentHandler` is properly imported
- Ensure no middleware is blocking the route

#### Issue: TypeScript compilation errors
**Solution:**
- Fix any type mismatches in `executeAgentHandler`
- Ensure all imports use `.js` extensions for ES modules

#### Issue: Railway routing problems
**Solution:**
- Check `railway.toml` configuration
- Verify the service is properly deployed
- Check Railway service logs

### 7. **Expected Server Startup Logs**
When the server starts, you should see:

```
✅ /execute-agent route registered
MCP Server listening on 0.0.0.0:3000
🚀 GHL API Server running on port 3000
🎯 Execute agent: http://localhost:3000/execute-agent
🌐 Railway URL: https://your-app.up.railway.app/execute-agent
📋 Registered routes:
  GET  /health
  POST /execute-agent
  POST /execute-legacy
  POST /clients
  GET  /clients
  DELETE /clients/:clientId
  POST /sessions
✅ Server ready for production deployment on Railway
```

### 8. **Testing with Postman**
Use this request in Postman:

**URL:** `https://your-app.up.railway.app/execute-agent`
**Method:** `POST`
**Headers:** `Content-Type: application/json`
**Body:**
```json
{
  "agentName": "nora",
  "clientId": "client_BG",
  "input": "Create a contact named John Doe with email john.doe@example.com"
}
```

### 9. **Expected Response**
Successful response should be:
```json
{
  "success": true,
  "result": {
    "action": "create_contact",
    "contact": {
      "id": "contact_id_123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    "message": "Contact created for John Doe"
  },
  "agentName": "nora",
  "clientId": "client_BG",
  "input": "Create a contact named John Doe with email john.doe@example.com",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "responseTime": "150ms"
}
```

### 10. **404 Handler Response**
If the route is not found, you should get:
```json
{
  "success": false,
  "error": "Route not found: POST /execute-agent",
  "availableRoutes": [
    "GET /health",
    "POST /execute-agent",
    "POST /execute-legacy",
    "POST /clients",
    "GET /clients",
    "DELETE /clients/:clientId",
    "POST /sessions"
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 11. **Emergency Fixes**

#### If route is still not working:
1. **Redeploy the service** in Railway
2. **Check environment variables** are set correctly
3. **Verify the build process** completed successfully
4. **Check Railway service logs** for any runtime errors

#### If you need to force a rebuild:
```bash
# In Railway CLI or dashboard
railway up --force
```

### 12. **Contact Information**
If issues persist:
- Check Railway service logs
- Verify all environment variables are set
- Ensure the service is properly deployed and running
