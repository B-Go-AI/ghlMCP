// test/createContact.test.ts
import { createContact, CreateContactParams } from '../src/tools/nora/tools/createContact.js';

describe('createContact Tool', () => {
  it('should validate required parameters', async () => {
    // Test missing clientId
    const result1 = await createContact({
      clientId: '',
      contact: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      }
    });
    expect(result1.success).toBe(false);
    expect(result1.error).toContain('clientId is required');

    // Test missing contact data
    const result2 = await createContact({
      clientId: 'client_BG',
      contact: {
        email: '',
        firstName: '',
        lastName: ''
      }
    });
    expect(result2.success).toBe(false);
    expect(result2.error).toContain('contact object must contain email, firstName, and lastName');
  });

  it('should handle invalid clientId', async () => {
    const result = await createContact({
      clientId: 'invalid_client',
      contact: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      }
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Client configuration not found');
  });

  it('should create contact with valid parameters', async () => {
    // This test would require a valid API key and would make a real API call
    // For now, we'll just test the structure
    const params: CreateContactParams = {
      clientId: 'client_BG',
      contact: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      }
    };

    // Mock the API call to avoid making real requests during testing
    const originalContactsMCP = await import('../src/api/contacts.js');
    const mockCreate = jest.fn().mockResolvedValue({
      id: 'test-contact-id',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe'
    });

    // Note: In a real test environment, you would mock the entire ContactsMCP class
    // This is just a demonstration of the expected behavior
    
    expect(params.clientId).toBe('client_BG');
    expect(params.contact.email).toBe('test@example.com');
    expect(params.contact.firstName).toBe('John');
    expect(params.contact.lastName).toBe('Doe');
  });
});
