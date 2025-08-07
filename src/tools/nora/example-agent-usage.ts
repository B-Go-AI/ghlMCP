// src/tools/nora/example-agent-usage.ts
// Example usage of the new agent execution endpoint for GHL MCP standard
// Compatible with Cursor, Claude, OpenAI Playground, and Windsurf

/**
 * Example: How AI agents can use the new /execute-agent endpoint
 * 
 * This endpoint follows the GHL MCP standard and allows any HTTP-compatible
 * AI agent to invoke MCP tools through natural language input.
 */

// Example 1: Contact Creation
const createContactExample = {
  url: 'https://your-app.up.railway.app/execute-agent',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    agentName: 'nora',
    clientId: 'client_BG',
    input: 'Create a contact named John Doe with email john.doe@example.com'
  }
};

// Example 2: SMS Sending
const sendSmsExample = {
  url: 'https://your-app.up.railway.app/execute-agent',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    agentName: 'nora',
    clientId: 'client_BG',
    input: 'Send SMS to 443-543-9200 with message "Your quote is ready."'
  }
};

// Example 3: Contact Update
const updateContactExample = {
  url: 'https://your-app.up.railway.app/execute-agent',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    agentName: 'nora',
    clientId: 'client_BG',
    input: 'Update contact john.doe@example.com phone number to 555-123-4567'
  }
};

// Example 4: Contact Lookup
const findContactExample = {
  url: 'https://your-app.up.railway.app/execute-agent',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    agentName: 'nora',
    clientId: 'client_BG',
    input: 'Find contact with email john.doe@example.com'
  }
};

/**
 * Expected Response Format
 * 
 * Success Response:
 * {
 *   "success": true,
 *   "result": {
 *     "action": "create_contact",
 *     "contact": {
 *       "id": "contact_id_123",
 *       "firstName": "John",
 *       "lastName": "Doe",
 *       "email": "john.doe@example.com"
 *     },
 *     "message": "Contact created for John Doe"
 *   },
 *   "agentName": "nora",
 *   "clientId": "client_BG",
 *   "input": "Create a contact named John Doe with email john.doe@example.com",
 *   "timestamp": "2024-01-15T10:30:00.000Z",
 *   "responseTime": "150ms"
 * }
 * 
 * Error Response:
 * {
 *   "success": false,
 *   "error": "Contact creation requires email, firstName, and lastName",
 *   "agentName": "nora",
 *   "clientId": "client_BG",
 *   "input": "Create a contact",
 *   "timestamp": "2024-01-15T10:30:00.000Z",
 *   "responseTime": "50ms"
 * }
 */

/**
 * Supported Natural Language Patterns
 * 
 * Contact Creation:
 * - "Create a contact named [FirstName] [LastName] with email [email]"
 * - "Add contact [FirstName] [LastName] email [email]"
 * - "New contact [FirstName] [LastName] [email]"
 * 
 * SMS Sending:
 * - "Send SMS to [phone] with message [message]"
 * - "Send message to [phone] [message]"
 * - "Text message [phone] [message]"
 * 
 * Contact Updates:
 * - "Update contact [email] phone number to [phone]"
 * - "Modify contact [email] name to [FirstName] [LastName]"
 * - "Edit contact [email] [field] to [value]"
 * 
 * Contact Lookup:
 * - "Find contact with email [email]"
 * - "Get contact [email]"
 * - "Lookup contact [email]"
 */

/**
 * Integration Examples for Different AI Platforms
 */

// Cursor AI Integration
export const cursorIntegration = `
// In Cursor AI, you can use this endpoint like:
const response = await fetch('https://your-app.up.railway.app/execute-agent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentName: 'nora',
    clientId: 'client_BG',
    input: 'Create a contact named Jane Smith with email jane.smith@example.com'
  })
});

const result = await response.json();
if (result.success) {
  console.log('Contact created:', result.result.contact.id);
}
`;

// Claude Integration
export const claudeIntegration = `
// In Claude, you can use this endpoint like:
const claudeResponse = await fetch('https://your-app.up.railway.app/execute-agent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentName: 'nora',
    clientId: 'client_BG',
    input: 'Send SMS to 555-123-4567 with message "Your appointment is confirmed."'
  })
});

const claudeResult = await claudeResponse.json();
if (claudeResult.success) {
  console.log('SMS sent:', claudeResult.result.text);
}
`;

// OpenAI Playground Integration
export const openaiIntegration = `
// In OpenAI Playground, you can use this endpoint like:
const openaiResponse = await fetch('https://your-app.up.railway.app/execute-agent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentName: 'nora',
    clientId: 'client_BG',
    input: 'Find contact with email john.doe@example.com'
  })
});

const openaiResult = await openaiResponse.json();
if (openaiResult.success) {
  console.log('Contact found:', openaiResult.result.contact);
}
`;

// Windsurf Integration
export const windsurfIntegration = `
// In Windsurf, you can use this endpoint like:
const windsurfResponse = await fetch('https://your-app.up.railway.app/execute-agent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentName: 'nora',
    clientId: 'client_BG',
    input: 'Update contact jane.smith@example.com name to Jane Johnson'
  })
});

const windsurfResult = await windsurfResponse.json();
if (windsurfResult.success) {
  console.log('Contact updated:', windsurfResult.result.message);
}
`;

/**
 * Error Handling Examples
 */
export const errorHandlingExamples = {
  validationError: {
    request: {
      agentName: 'nora',
      // Missing clientId and input
    },
    expectedResponse: {
      success: false,
      error: 'Validation error',
      status: 400
    }
  },
  
  unrecognizedAction: {
    request: {
      agentName: 'nora',
      clientId: 'client_BG',
      input: 'Do something completely unrelated'
    },
    expectedResponse: {
      success: false,
      error: 'Unrecognized action. Supported actions: create contact, send SMS, update contact, find contact.',
      status: 500
    }
  },
  
  clientNotFound: {
    request: {
      agentName: 'nora',
      clientId: 'invalid_client',
      input: 'Create a contact named John Doe with email john@example.com'
    },
    expectedResponse: {
      success: false,
      error: 'Client configuration not found for clientId: invalid_client',
      status: 500
    }
  }
};

/**
 * Testing the Endpoint
 */
export const testEndpoint = async () => {
  try {
    const response = await fetch('https://your-app.up.railway.app/execute-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentName: 'nora',
        clientId: 'client_BG',
        input: 'Create a contact named Test User with email test@example.com'
      })
    });

    const result = await response.json();
    console.log('Test result:', result);
    
    if (result.success) {
      console.log('✅ Test passed! Contact created successfully.');
    } else {
      console.log('❌ Test failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// Export examples for easy access
export {
  createContactExample,
  sendSmsExample,
  updateContactExample,
  findContactExample
};
