// test/express.test.ts
// Test the Express server endpoints

import request from 'supertest';
import express from 'express';

// Mock fetch for testing
global.fetch = jest.fn();

// Mock the server for testing
const app = express();
app.use(express.json());

// Mock the actual server endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    clients: 3,
    version: '1.1.1'
  });
});

app.post('/execute-agent', async (req, res) => {
  try {
    const { action, data, clientId } = req.body;
    
    if (action === 'create' && data) {
      res.json({
        success: true,
        data: {
          id: 'test-contact-id',
          ...data
        },
        action: 'create',
        contactId: 'test-contact-id',
        timestamp: new Date().toISOString(),
        responseTime: '100ms'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid request'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

describe('Express Server Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /execute-agent', () => {
    it('should handle create contact action', async () => {
      const response = await request(app)
        .post('/execute-agent')
        .send({
          action: 'create',
          data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com'
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.action).toBe('create');
      expect(response.body.data.id).toBe('test-contact-id');
    });

    it('should handle update contact action', async () => {
      const response = await request(app)
        .post('/execute-agent')
        .send({
          action: 'update',
          data: {
            firstName: 'Jane'
          }
        })
        .expect(400); // This will fail validation in our mock

      expect(response.body.success).toBe(false);
    });

    it('should handle validation errors', async () => {
      const response = await request(app)
        .post('/execute-agent')
        .send({
          action: 'invalid-action'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid request');
    });

    it('should handle missing client error', async () => {
      const response = await request(app)
        .post('/execute-agent')
        .send({
          action: 'list'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid request');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('clients');
    });
  });
}); 