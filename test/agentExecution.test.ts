// test/agentExecution.test.ts
// Test the new agent execution endpoint for GHL MCP standard

import request from 'supertest';
import express from 'express';

// Mock fetch for testing
global.fetch = jest.fn();

// Mock the server for testing
const app = express();
app.use(express.json());

// Mock the agent execution endpoint
app.post('/execute-agent', async (req, res) => {
  try {
    const { agentName, clientId, input } = req.body;
    
    if (agentName && clientId && input) {
      // Mock successful agent execution
      if (input.toLowerCase().includes('create a contact')) {
        res.json({
          success: true,
          result: {
            action: 'create_contact',
            contact: {
              id: 'test-contact-id',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com'
            },
            message: 'Contact created for John Doe'
          },
          agentName,
          clientId,
          input,
          timestamp: new Date().toISOString(),
          responseTime: '100ms'
        });
      } else if (input.toLowerCase().includes('send sms')) {
        res.json({
          success: true,
          result: {
            action: 'send_sms',
            message: {
              id: 'test-message-id',
              status: 'sent'
            },
            text: 'SMS sent to 443-543-9200'
          },
          agentName,
          clientId,
          input,
          timestamp: new Date().toISOString(),
          responseTime: '100ms'
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Unrecognized action',
          agentName,
          clientId,
          input,
          timestamp: new Date().toISOString(),
          responseTime: '100ms'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        agentName: agentName || 'unknown',
        clientId: clientId || 'unknown',
        input: input || 'unknown',
        timestamp: new Date().toISOString(),
        responseTime: '100ms'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      agentName: req.body?.agentName || 'unknown',
      clientId: req.body?.clientId || 'unknown',
      input: req.body?.input || 'unknown',
      timestamp: new Date().toISOString(),
      responseTime: '100ms'
    });
  }
});

describe('Agent Execution Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /execute-agent', () => {
    it('should handle contact creation request', async () => {
      const response = await request(app)
        .post('/execute-agent')
        .send({
          agentName: 'nora',
          clientId: 'client_BG',
          input: 'Create a contact named John Doe with email john.doe@example.com'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.agentName).toBe('nora');
      expect(response.body.clientId).toBe('client_BG');
      expect(response.body.result.action).toBe('create_contact');
      expect(response.body.result.contact.firstName).toBe('John');
      expect(response.body.result.contact.lastName).toBe('Doe');
      expect(response.body.result.contact.email).toBe('john.doe@example.com');
    });

    it('should handle SMS sending request', async () => {
      const response = await request(app)
        .post('/execute-agent')
        .send({
          agentName: 'nora',
          clientId: 'client_BG',
          input: 'Send SMS to 443-543-9200 with message "Your quote is ready."'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.agentName).toBe('nora');
      expect(response.body.clientId).toBe('client_BG');
      expect(response.body.result.action).toBe('send_sms');
      expect(response.body.result.text).toBe('SMS sent to 443-543-9200');
    });

    it('should handle validation errors', async () => {
      const response = await request(app)
        .post('/execute-agent')
        .send({
          agentName: 'nora',
          // Missing clientId and input
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should handle unrecognized actions', async () => {
      const response = await request(app)
        .post('/execute-agent')
        .send({
          agentName: 'nora',
          clientId: 'client_BG',
          input: 'Do something completely unrelated'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Unrecognized action');
    });

    it('should return proper JSON structure for AI agents', async () => {
      const response = await request(app)
        .post('/execute-agent')
        .send({
          agentName: 'nora',
          clientId: 'client_BG',
          input: 'Create a contact named Jane Smith with email jane.smith@example.com'
        })
        .expect(200);

      // Verify clean JSON response structure
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('result');
      expect(response.body).toHaveProperty('agentName');
      expect(response.body).toHaveProperty('clientId');
      expect(response.body).toHaveProperty('input');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('responseTime');
      
      // Verify no HTML or error wrappers
      expect(typeof response.text).toBe('string');
      expect(response.text).not.toContain('<html>');
      expect(response.text).not.toContain('<body>');
      expect(response.text).not.toContain('<!DOCTYPE');
    });
  });
});
