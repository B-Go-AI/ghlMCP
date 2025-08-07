// src/tools/nora/tools/createContact.ts
// Tool for creating GoHighLevel contacts via MCP server
// Designed to be used by LangChain agent executor

import { CLIENTS } from '../../clients.js';

/**
 * Interface for the createContact function parameters
 */
export interface CreateContactParams {
  clientId: string;
  contact: {
    email: string;
    firstName: string;
    lastName: string;
    [key: string]: any; // Allow additional contact fields
  };
}

/**
 * Interface for the createContact function response
 */
export interface CreateContactResponse {
  success: boolean;
  contact?: any;
  error?: string;
  contactId?: string;
}

/**
 * Creates a new contact in GoHighLevel via MCP server
 * 
 * @param params - Object containing clientId and contact details
 * @returns Promise<CreateContactResponse> - The result of the contact creation
 */
export async function createContact(params: CreateContactParams): Promise<CreateContactResponse> {
  try {
    const { clientId, contact } = params;

    // Validate required parameters
    if (!clientId) {
      throw new Error('clientId is required');
    }

    if (!contact || !contact.email || !contact.firstName || !contact.lastName) {
      throw new Error('contact object must contain email, firstName, and lastName');
    }

    // Get client configuration
    const clientConfig = CLIENTS[clientId];
    if (!clientConfig) {
      throw new Error(`Client configuration not found for clientId: ${clientId}`);
    }

    // Extract pit and locationId from client config
    const { pit, locationId } = clientConfig;

    if (!pit) {
      throw new Error(`PIT token not found for clientId: ${clientId}`);
    }

    if (!locationId) {
      throw new Error(`Location ID not found for clientId: ${clientId}`);
    }

    // Make direct POST request to MCP endpoint
    const response = await fetch('https://services.leadconnectorhq.com/mcp/contacts_create-contact', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pit}`,
        'locationId': locationId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contact)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    return {
      success: true,
      contact: result,
      contactId: result?.id
    };

  } catch (error) {
    console.error('Error creating contact:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Export the main function as default for easy importing
export default createContact;
