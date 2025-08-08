import express from 'express';
import dotenv from 'dotenv';
import { GHLClient } from './ghl-client.js';
import { ContactRoutes } from './routes/contacts.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize GHL client
const ghlClient = new GHLClient({
  clientId: process.env.GHL_CLIENT_ID || '68502d2fa96710afbdc97eeb-mbz7zc8a',
  clientSecret: process.env.GHL_CLIENT_SECRET || '',
  accessToken: process.env.GHL_ACCESS_TOKEN || '',
  refreshToken: process.env.GHL_REFRESH_TOKEN || '',
  locationId: process.env.GHL_LOCATION_ID || 'gMgcCQOGXIn1DK6lCDa7'
});

// Initialize routes
const contactRoutes = new ContactRoutes(ghlClient);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0-simple'
  });
});

// n8n Compatibility Endpoint - /execute-agent
app.post('/execute-agent', async (req, res) => {
  try {
    console.log('🔍 /execute-agent called with body:', JSON.stringify(req.body, null, 2));
    
    const { action, data, contactIdentifier, clientId, input, agentName } = req.body;
    
    // Handle different n8n formats
    let actualAction = action;
    let actualData = data;
    
    // If no action, try to infer from input or other fields
    if (!actualAction) {
      if (input && typeof input === 'string') {
        // Try to parse action from input string
        if (input.toLowerCase().includes('create') && input.toLowerCase().includes('contact')) {
          actualAction = 'create';
        } else if (input.toLowerCase().includes('search') || input.toLowerCase().includes('find')) {
          actualAction = 'search';
        } else if (input.toLowerCase().includes('update')) {
          actualAction = 'update';
        } else if (input.toLowerCase().includes('sms') || input.toLowerCase().includes('message')) {
          actualAction = 'sms';
        }
      }
    }
    
    // If still no action, default to create
    if (!actualAction) {
      actualAction = 'create';
    }
    
    // If no data, try to extract from input
    if (!actualData && input) {
      if (typeof input === 'string') {
        // Simple parsing for common patterns
        const emailMatch = input.match(/[\w.-]+@[\w.-]+\.\w+/);
        const nameMatch = input.match(/(?:named|name)\s+([A-Za-z]+\s+[A-Za-z]+)/i);
        
        if (emailMatch || nameMatch) {
          actualData = {
            email: emailMatch ? emailMatch[0] : undefined,
            firstName: nameMatch ? nameMatch[1].split(' ')[0] : undefined,
            lastName: nameMatch ? nameMatch[1].split(' ')[1] : undefined
          };
        }
      }
    }
    
    console.log('🔧 Processed request:', { actualAction, actualData, contactIdentifier, clientId });
    
    switch (actualAction) {
      case 'create':
        const contact = await ghlClient.createContact(actualData);
        res.json({
          success: true,
          contact,
          action: 'create',
          timestamp: new Date().toISOString()
        });
        break;
        
      case 'search':
        const contacts = await ghlClient.searchContacts(actualData?.email);
        res.json({
          success: true,
          contacts,
          action: 'search',
          timestamp: new Date().toISOString()
        });
        break;
        
      case 'update':
        if (!contactIdentifier) {
          return res.status(400).json({
            success: false,
            error: 'contactIdentifier required for update'
          });
        }
        const updatedContact = await ghlClient.updateContact(contactIdentifier, actualData);
        res.json({
          success: true,
          contact: updatedContact,
          action: 'update',
          timestamp: new Date().toISOString()
        });
        break;
        
      case 'sms':
        const smsResult = await ghlClient.sendSMS(actualData.phone, actualData.message);
        res.json({
          success: true,
          result: smsResult,
          action: 'sms',
          timestamp: new Date().toISOString()
        });
        break;
        
      default:
        res.status(400).json({
          success: false,
          error: `Unknown action: ${action}`,
          supportedActions: ['create', 'search', 'update', 'sms']
        });
    }
    
  } catch (error) {
    console.error('❌ /execute-agent error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Contact routes
app.post('/contacts', (req, res) => contactRoutes.createContact(req, res));
app.get('/contacts', (req, res) => contactRoutes.searchContacts(req, res));
app.put('/contacts/:contactId', (req, res) => contactRoutes.updateContact(req, res));
app.post('/sms', (req, res) => contactRoutes.sendSMS(req, res));

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple GHL Server listening on port ${PORT}`);
  console.log(`🌐 URL: https://ghlmcp-production.up.railway.app`);
  console.log(`📋 Available endpoints:`);
  console.log(`  POST /execute-agent - n8n compatibility`);
  console.log(`  POST /contacts - Create contact`);
  console.log(`  GET  /contacts - Search contacts`);
  console.log(`  PUT  /contacts/:id - Update contact`);
  console.log(`  POST /sms - Send SMS`);
  console.log(`  GET  /health - Health check`);
});
