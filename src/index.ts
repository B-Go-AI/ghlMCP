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
  console.log(`  POST /contacts - Create contact`);
  console.log(`  GET  /contacts - Search contacts`);
  console.log(`  PUT  /contacts/:id - Update contact`);
  console.log(`  POST /sms - Send SMS`);
  console.log(`  GET  /health - Health check`);
});
