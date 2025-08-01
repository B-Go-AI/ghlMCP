import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { z } from 'zod';
import { ClientMap } from './api/client-map.js';
import { ContactsMCP } from './api/contacts.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

// Initialize client map
const clientMap = new ClientMap();

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    clients: clientMap.listClients().length,
    version: '1.1.1'
  });
});

// Main execution endpoint for n8n
app.post('/execute-agent', async (req: Request, res: Response) => {
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
    } else if (validatedRequest.sessionKey) {
      // Use session key mapping
      targetClient = clientMap.getClientBySession(validatedRequest.sessionKey);
      console.log(`🔑 Using session key: ${validatedRequest.sessionKey}`);
    } else if (validatedRequest.contactIdentifier) {
      // Find client by contact identifier
      targetClient = await clientMap.getClientByContact(validatedRequest.contactIdentifier);
      console.log(`👤 Found client by contact: ${validatedRequest.contactIdentifier}`);
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
    
    // Initialize contacts API
    const contactsApi = new ContactsMCP(targetClient.client);
    
    // Execute the requested action
    let result: any;
    let contactId = validatedRequest.contactIdentifier || targetClient.contactId;
    
    console.log(`⚡ Executing action: ${validatedRequest.action}`);
    
    switch (validatedRequest.action) {
      case 'create':
        if (!validatedRequest.data) {
          throw new Error('Data is required for create action');
        }
        result = await contactsApi.create({
          ...validatedRequest.data,
          locationId: targetClient.config.locationId
        });
        console.log('✅ Contact created:', result.id);
        break;
        
      case 'update':
        if (!contactId) {
          throw new Error('Contact identifier is required for update action');
        }
        if (!validatedRequest.data) {
          throw new Error('Data is required for update action');
        }
        result = await contactsApi.update(contactId, targetClient.config.locationId, validatedRequest.data);
        console.log('✅ Contact updated:', contactId);
        break;
        
      case 'get':
        if (!contactId) {
          throw new Error('Contact identifier is required for get action');
        }
        result = await contactsApi.get(contactId, targetClient.config.locationId);
        console.log('✅ Contact retrieved:', contactId);
        break;
        
      case 'list':
        result = await contactsApi.list(targetClient.config.locationId);
        console.log(`✅ Listed ${Array.isArray(result) ? result.length : 0} contacts`);
        break;
        
      case 'delete':
        if (!contactId) {
          throw new Error('Contact identifier is required for delete action');
        }
        result = await contactsApi.delete(contactId, targetClient.config.locationId);
        console.log('✅ Contact deleted:', contactId);
        break;
        
      case 'upsert':
        if (!validatedRequest.data) {
          throw new Error('Data is required for upsert action');
        }
        result = await contactsApi.upsert({
          ...validatedRequest.data,
          locationId: targetClient.config.locationId
        });
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

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MCP Server listening on 0.0.0.0:${PORT}`);
  console.log(`🚀 GHL API Server running on port ${PORT}`);
  console.log(`🎯 Execute agent: http://localhost:${PORT}/execute-agent`);
  
  // Log available clients
  const clients = clientMap.listClients();
  if (clients.length > 0) {
    console.log(`📋 Loaded clients: ${clients.map(c => c.id).join(', ')}`);
  } else {
    console.log('⚠️  No clients configured. Set GHL_API_KEY and GHL_LOCATION_ID environment variables.');
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
