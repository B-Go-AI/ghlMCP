// test/express.test.ts
// Test the Express server endpoints

import request from 'supertest';
import express from 'express';
import { ClientMap } from '../src/api/client-map.js';
import { ContactsMCP } from '../src/api/contacts.js';

// Mock the server for testing
const app = express();
app.use(express.json());

// Mock client map
const mockClientMap = {
  getClient: jest.fn(),
  getConfig: jest.fn(),
  getClientBySession: jest.fn(),
  getClientByContact: jest.fn(),
  getDefaultClient: jest.fn(),
  listClients: jest.fn(() => []),
  addClient: jest.fn(),
  removeClient: jest.fn(),
  addSessionMapping: jest.fn()
};

// Mock contacts API
const mockContactsApi = {
  create: jest.fn(),
  update: jest.fn(),
  get: jest.fn(),
  list: jest.fn(),
  delete: jest.fn(),
  upsert: jest.fn()
};

// Mock HighLevelApiClient
jest.mock('../src/api/client-map', () => ({
  ClientMap: jest.fn().mockImplementation(() => mockClientMap)
}));

jest.mock('../src/api/contacts', () => ({
  ContactsMCP: jest.fn().mockImplementation(() => mockContactsApi)
}));

describe('Express Server Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /execute-agent', () => {
    it('should handle create contact action', async () => {
      const mockClient = { request: jest.fn() };
      const mockConfig = { locationId: 'test-location', name: 'client_BG', client_key: 'client_BG' };
      
      mockClientMap.getDefaultClient.mockReturnValue({
        client: mockClient,
        config: mockConfig
      });
      
      mockContactsApi.create.mockResolvedValue({
        id: 'test-contact-id',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      });

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
      const mockClient = { request: jest.fn() };
      const mockConfig = { locationId: 'test-location', name: 'client_BG', client_key: 'client_BG' };
      
      mockClientMap.getClientByContact.mockResolvedValue({
        client: mockClient,
        config: mockConfig,
        contactId: 'existing-contact-id'
      });
      
      mockContactsApi.update.mockResolvedValue({
        id: 'existing-contact-id',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com'
      });

      const response = await request(app)
        .post('/execute-agent')
        .send({
          action: 'update',
          contactIdentifier: 'jane@example.com',
          data: {
            firstName: 'Jane'
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.action).toBe('update');
      expect(response.body.data.firstName).toBe('Jane');
    });

    it('should handle validation errors', async () => {
      const response = await request(app)
        .post('/execute-agent')
        .send({
          action: 'invalid-action'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should handle missing client error', async () => {
      mockClientMap.getDefaultClient.mockReturnValue(null);

      const response = await request(app)
        .post('/execute-agent')
        .send({
          action: 'list'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('No valid client found');
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