// src/tools/nora/tools/createContact.ts
// Tool for creating GoHighLevel contacts via MCP server
// Designed to be used by LangChain agent executor

import { CLIENTS } from '../../clients.js';
import { HighLevelApiClient } from '../../api/client.js';
import { ContactsMCP } from '../../api/contacts.js';

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

    // Create API client with the PIT token
    const apiClient = new HighLevelApiClient(pit);
    
    // Create contacts API wrapper
    const contactsApi = new ContactsMCP(apiClient);

    // Prepare contact data with locationId
    const contactData = {
      ...contact,
      locationId
    };

    // Create the contact using the existing API infrastructure
    const createdContact = await contactsApi.create(contactData);

    return {
      success: true,
      contact: createdContact,
      contactId: createdContact.id
    };

  } catch (error) {
    console.error('Error creating contact:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Alternative implementation using direct MCP client call
 * This follows the pattern you described with mcpClient.call()
 * 
 * Note: This assumes you have an MCP client available that can call
 * the "contacts_create-contact" method. You'll need to import and
 * configure the MCP client according to your setup.
 */
export async function createContactViaMCP(params: CreateContactParams): Promise<CreateContactResponse> {
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

    // TODO: Import and configure your MCP client
    // const { mcpClient } = await import('your-mcp-client-module');
    
    // Call the MCP server method
    const result = await mcpClient.call("contacts_create-contact", {
      headers: {
        Authorization: `Bearer ${pit}`
      },
      locationId,
      body: contact
    });

    return {
      success: true,
      contact: result,
      contactId: result?.id
    };

  } catch (error) {
    console.error('Error creating contact via MCP:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Export the main function as default for easy importing
export default createContact;
