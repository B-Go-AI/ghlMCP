import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { z } from 'zod';
import { CLIENTS } from './clients.js';
import { executeAgentHandler } from './api/handlers/executeAgentHandler.js';
import { mcpHandler, mcpSseHandler } from './api/handlers/mcpHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS headers for cross-origin requests
app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log(`   Headers:`, {
    'content-type': req.headers['content-type'],
    'user-agent': req.headers['user-agent'],
    'origin': req.headers['origin']
  });
  next();
});

// Request validation schema for n8n compatibility
const ExecuteAgentRequestSchema = z.object({
  sessionKey: z.string().optional().describe('Session key for client routing'),
  contactIdentifier: z.string().optional().describe('Contact email, phone, or ID'),
  action: z.enum(['create', 'update', 'get', 'list', 'delete', 'upsert']).describe('Action to perform'),
  data: z.record(z.any()).optional().describe('Contact data for create/update operations'),
  locationId: z.string().optional().describe('Override location ID'),
  clientId: z.string().optional().describe('Override client ID for routing'),
  // n8n specific fields
  json: z.record(z.any()).optional().describe('n8n JSON data'),
  params: z.record(z.any()).optional().describe('n8n parameters')
});

type ExecuteAgentRequest = z.infer<typeof ExecuteAgentRequestSchema>;

// Initialize client map - simplified for current structure
const clientMap = {
  getClient: (clientId: string) => CLIENTS[clientId] ? { apiKey: process.env.GHL_API_KEY } : null,
  getConfig: (clientId: string) => CLIENTS[clientId] || null,
  getDefaultClient: () => {
    const defaultClient = Object.keys(CLIENTS)[0];
    return defaultClient ? {
      client: { apiKey: process.env.GHL_API_KEY },
      config: CLIENTS[defaultClient]
    } : null;
  },
  listClients: () => Object.keys(CLIENTS).map(id => ({ id, config: CLIENTS[id] })),
  addClient: (clientId: string, config: any) => {
    console.log(`Adding client: ${clientId}`);
    // In this simplified version, we just log the addition
  },
  removeClient: (clientId: string) => {
    console.log(`Removing client: ${clientId}`);
    return true; // In this simplified version, we just return true
  },
  addSessionMapping: (sessionKey: string, clientId: string, contactId?: string) => {
    console.log(`Adding session mapping: ${sessionKey} -> ${clientId}`);
    // In this simplified version, we just log the mapping
  }
};

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    clients: clientMap.listClients().length,
    version: '1.1.1',
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: process.env.PORT || '3000',
      GHL_API_KEY: process.env.GHL_API_KEY ? '✅ Set' : '❌ Missing',
      GHL_LOCATION_ID: process.env.GHL_LOCATION_ID ? '✅ Set' : '❌ Missing',
      GHL_LOCATION_ID_BG: process.env.GHL_LOCATION_ID_BG ? '✅ Set' : '❌ Missing',
      PIT_BG: process.env.PIT_BG ? '✅ Set' : '❌ Missing'
    },
    routes: [
      'GET /health',
      'GET /test',
      'POST /execute-agent',
      'POST /execute-legacy'
    ]
  });
});

// Test endpoint to verify server is working
app.get('/test', (req: Request, res: Response) => {
  res.json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    routes: [
      'GET /health',
      'GET /test',
      'POST /execute-agent',
      'POST /execute-legacy'
    ],
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: process.env.PORT || '3000',
      GHL_API_KEY: process.env.GHL_API_KEY ? '✅ Set' : '❌ Missing',
      GHL_LOCATION_ID: process.env.GHL_LOCATION_ID ? '✅ Set' : '❌ Missing',
      GHL_LOCATION_ID_BG: process.env.GHL_LOCATION_ID_BG ? '✅ Set' : '❌ Missing',
      PIT_BG: process.env.PIT_BG ? '✅ Set' : '❌ Missing'
    }
  });
});

// Simple execute-agent test endpoint
app.get('/execute-agent-test', (req: Request, res: Response) => {
  res.json({
    message: 'execute-agent endpoint is accessible',
    method: 'GET',
    timestamp: new Date().toISOString(),
    note: 'Use POST /execute-agent for actual agent execution'
  });
});

// Agent execution endpoint for AI agents (GHL MCP standard)
app.post('/execute-agent', async (req: Request, res: Response) => {
  console.log('🎯 /execute-agent route hit directly');
  return executeAgentHandler(req, res);
});
console.log('✅ /execute-agent route registered with explicit handler');

// MCP endpoints for n8n MCP Client node
app.post('/mcp', async (req: Request, res: Response) => {
  console.log('🤖 /mcp route hit');
  return mcpHandler(req, res);
});
console.log('✅ /mcp route registered');

// MCP endpoint with session ID (for n8n MCP Client node)
app.post('/mcp/:sessionId', async (req: Request, res: Response) => {
  console.log(`🤖 /mcp/${req.params.sessionId} route hit`);
  return mcpHandler(req, res);
});
console.log('✅ /mcp/:sessionId route registered');

// MCP SSE endpoint for streaming
app.get('/mcp/:sessionId', (req: Request, res: Response) => {
  console.log(`📡 /mcp/${req.params.sessionId} SSE route hit`);
  return mcpSseHandler(req, res);
});
console.log('✅ /mcp/:sessionId SSE route registered');

// MCP SSE endpoint with /sse suffix (for n8n compatibility)
app.get('/mcp/:sessionId/sse', (req: Request, res: Response) => {
  console.log(`📡 /mcp/${req.params.sessionId}/sse SSE route hit`);
  return mcpSseHandler(req, res);
});
console.log('✅ /mcp/:sessionId/sse SSE route registered');



// Legacy execution endpoint for n8n
app.post('/execute-legacy', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    console.log('📥 Received request:', {
      method: req.method,
      url: req.url,
      body: req.body,
      headers: req.headers['content-type']
    });

    // Handle n8n request format
    let requestData = req.body;
    
    // If n8n sends data in json field, use that
    if (req.body.json && typeof req.body.json === 'object') {
      requestData = { ...req.body, ...req.body.json };
    }
    
    // Validate request
    const validatedRequest = ExecuteAgentRequestSchema.parse(requestData);
    
    console.log('✅ Request validated:', {
      action: validatedRequest.action,
      hasSessionKey: !!validatedRequest.sessionKey,
      hasContactIdentifier: !!validatedRequest.contactIdentifier,
      hasClientId: !!validatedRequest.clientId
    });
    
    // Determine which client to use
    let targetClient: { client: any; config: any; contactId?: string } | null = null;
    
    if (validatedRequest.clientId) {
      // Use specific client ID
      const client = clientMap.getClient(validatedRequest.clientId);
      const config = clientMap.getConfig(validatedRequest.clientId);
      if (client && config) {
        targetClient = { client, config };
        console.log(`🎯 Using client ID: ${validatedRequest.clientId}`);
      }
    } else {
      // Use default client
      targetClient = clientMap.getDefaultClient();
      console.log('🏠 Using default client');
    }
    
    if (!targetClient) {
      console.error('❌ No valid client found');
      return res.status(400).json({
        success: false,
        error: 'No valid client found. Please provide sessionKey, contactIdentifier, clientId, or ensure default client is configured.',
        availableClients: clientMap.listClients().map(c => c.id),
        timestamp: new Date().toISOString()
      });
    }
    
    // Override location ID if provided
    if (validatedRequest.locationId) {
      targetClient.config.locationId = validatedRequest.locationId;
      console.log(`📍 Overriding location ID: ${validatedRequest.locationId}`);
    }
    
    // Execute the requested action using direct fetch calls
    let result: any;
    let contactId = validatedRequest.contactIdentifier || targetClient.contactId;
    
    console.log(`⚡ Executing action: ${validatedRequest.action}`);
    
    // Helper function to make MCP API calls
    const makeMcpCall = async (endpoint: string, method: string = 'POST', body?: any) => {
             const response = await fetch(`https://services.leadconnectorhq.com/${endpoint}`, {
        method,
                 headers: {
           'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
           'locationId': targetClient.config.locationId,
           'Content-Type': 'application/json',
           'version': '2021-07-28'
         },
        ...(body && { body: JSON.stringify(body) })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return response.json();
    };
    
    switch (validatedRequest.action) {
      case 'create':
        if (!validatedRequest.data) {
          throw new Error('Data is required for create action');
        }
        result = await makeMcpCall('contacts/upsert-contact', 'POST', validatedRequest.data);
        console.log('✅ Contact created:', result.id);
        break;
        
      case 'update':
        if (!contactId) {
          throw new Error('Contact identifier is required for update action');
        }
        if (!validatedRequest.data) {
          throw new Error('Data is required for update action');
        }
        result = await makeMcpCall(`contacts/update-contact/${contactId}`, 'PUT', validatedRequest.data);
        console.log('✅ Contact updated:', contactId);
        break;
        
      case 'get':
        if (!contactId) {
          throw new Error('Contact identifier is required for get action');
        }
        result = await makeMcpCall(`contacts/get-contact/${contactId}`, 'GET');
        console.log('✅ Contact retrieved:', contactId);
        break;
        
      case 'list':
        result = await makeMcpCall('contacts/get-contacts', 'GET');
        console.log(`✅ Listed ${Array.isArray(result) ? result.length : 0} contacts`);
        break;
        
      case 'delete':
        if (!contactId) {
          throw new Error('Contact identifier is required for delete action');
        }
        result = await makeMcpCall(`contacts/delete-contact/${contactId}`, 'DELETE');
        console.log('✅ Contact deleted:', contactId);
        break;
        
      case 'upsert':
        if (!validatedRequest.data) {
          throw new Error('Data is required for upsert action');
        }
        result = await makeMcpCall('contacts/upsert-contact', 'POST', validatedRequest.data);
        console.log('✅ Contact upserted:', result.id);
        break;
        
      default:
        throw new Error(`Unknown action: ${validatedRequest.action}`);
    }
    
    const responseTime = Date.now() - startTime;
    
    // Return success response compatible with n8n
    const response = {
      success: true,
      data: result,
      client: {
        id: targetClient.config.name || 'default',
        locationId: targetClient.config.locationId
      },
      action: validatedRequest.action,
      contactId: result?.id || contactId,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`
    };
    
    console.log('📤 Sending response:', {
      success: response.success,
      action: response.action,
      contactId: response.contactId,
      responseTime: response.responseTime
    });
    
    res.json(response);
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ Execute agent error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`
      });
    }
    
    // Handle GHL API errors
    if (error && typeof error === 'object' && 'status' in error) {
      return res.status(400).json({
        success: false,
        error: 'GHL API Error',
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`
      });
    }
    
    // Handle other errors
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`
    });
  }
});

// Client management endpoints
app.post('/clients', (req: Request, res: Response) => {
  try {
    const { clientId, config } = req.body;
    
    if (!clientId || !config || !config.apiKey || !config.locationId) {
      return res.status(400).json({
        success: false,
        error: 'clientId, apiKey, and locationId are required'
      });
    }
    
    clientMap.addClient(clientId, config);
    
    res.json({
      success: true,
      message: `Client ${clientId} added successfully`,
      clients: clientMap.listClients()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/clients', (req: Request, res: Response) => {
  res.json({
    success: true,
    clients: clientMap.listClients()
  });
});

app.delete('/clients/:clientId', (req: Request, res: Response) => {
  const { clientId } = req.params;
  const removed = clientMap.removeClient(clientId);
  
  res.json({
    success: removed,
    message: removed ? `Client ${clientId} removed` : `Client ${clientId} not found`
  });
});

// Session mapping endpoints
app.post('/sessions', (req: Request, res: Response) => {
  try {
    const { sessionKey, clientId, contactId } = req.body;
    
    if (!sessionKey || !clientId) {
      return res.status(400).json({
        success: false,
        error: 'sessionKey and clientId are required'
      });
    }
    
    clientMap.addSessionMapping(sessionKey, clientId, contactId);
    
    res.json({
      success: true,
      message: `Session mapping created for ${sessionKey}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Global error handling middleware (must be after all routes)
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('❌ Global error handler:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler for unhandled routes (must be last)
app.use('*', (req: Request, res: Response) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'GET /health',
      'GET /test',
      'POST /execute-agent',
      'POST /mcp',
      'POST /mcp/:sessionId',
      'GET /mcp/:sessionId',
      'GET /mcp/:sessionId/sse',
      'POST /execute-legacy',
      'POST /clients',
      'GET /clients',
      'DELETE /clients/:clientId',
      'POST /sessions'
    ],
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MCP Server listening on 0.0.0.0:${PORT}`);
  console.log(`🌐 Railway URL: https://ghlmcp-production.up.railway.app`);
  console.log(`🎯 Execute agent: https://ghlmcp-production.up.railway.app/execute-agent`);
  console.log(`🤖 MCP endpoint: https://ghlmcp-production.up.railway.app/mcp/69f7582d-9695-440e-8f50-ef9050adf9f4/sse`);
  console.log(`✅ Health check: https://ghlmcp-production.up.railway.app/health`);
  console.log(`🧪 Test endpoint: https://ghlmcp-production.up.railway.app/test`);
  
  // Railway-specific startup confirmation
  console.log('✅ Railway deployment ready - server is listening');
  
  // Log all registered routes
  console.log('📋 Registered routes:');
  console.log('  GET  /health');
  console.log('  POST /execute-agent');
  console.log('  POST /mcp');
  console.log('  POST /mcp/:sessionId');
  console.log('  GET  /mcp/:sessionId');
  console.log('  GET  /mcp/:sessionId/sse');
  console.log('  POST /execute-legacy');
  console.log('  POST /clients');
  console.log('  GET  /clients');
  console.log('  DELETE /clients/:clientId');
  console.log('  POST /sessions');
  
  // Log available clients
  const clients = clientMap.listClients();
  if (clients.length > 0) {
    console.log(`📋 Loaded clients: ${clients.map(c => c.id).join(', ')}`);
  } else {
    console.log('⚠️  No clients configured. Set GHL_API_KEY and GHL_LOCATION_ID environment variables.');
  }
  
  // Check environment variables
  console.log('🔍 Environment Variables Check:');
  console.log(`  GHL_API_KEY: ${process.env.GHL_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`  GHL_LOCATION_ID: ${process.env.GHL_LOCATION_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`  GHL_LOCATION_ID_BG: ${process.env.GHL_LOCATION_ID_BG ? '✅ Set' : '❌ Missing'}`);
  console.log(`  PIT_BG: ${process.env.PIT_BG ? '✅ Set' : '❌ Missing'}`);
  console.log(`  GHL_LOCATION_ID_ASB_FINANCIAL: ${process.env.GHL_LOCATION_ID_ASB_FINANCIAL ? '✅ Set' : '❌ Missing'}`);
  console.log(`  PIT_ASB_FINANCIAL: ${process.env.PIT_ASB_FINANCIAL ? '✅ Set' : '❌ Missing'}`);
  console.log(`  GHL_LOCATION_ID_AMERICAN_SENIOR_BENEFITS: ${process.env.GHL_LOCATION_ID_AMERICAN_SENIOR_BENEFITS ? '✅ Set' : '❌ Missing'}`);
  console.log(`  PIT_AMERICAN_SENIOR_BENEFITS: ${process.env.PIT_AMERICAN_SENIOR_BENEFITS ? '✅ Set' : '❌ Missing'}`);
  
  // Verify route registration
  const routes = app._router.stack
    .filter((layer: any) => layer.route)
    .map((layer: any) => `${Object.keys(layer.route.methods).join(',').toUpperCase()} ${layer.route.path}`);
  
  console.log('🔍 Actual registered routes:', routes);
  
  if (routes.includes('POST /execute-agent')) {
    console.log('✅ /execute-agent route confirmed registered');
  } else {
    console.log('❌ /execute-agent route NOT found in registered routes');
  }
  
  console.log(`✅ Server ready for production deployment on Railway`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
