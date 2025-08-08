// src/api/handlers/mcpHandler.ts
// MCP (Model Context Protocol) handler for n8n MCP Client node
// Implements the official MCP protocol specification

import { Request, Response } from 'express';
import { CLIENTS } from '../../clients.js';

// MCP Tool definitions for all Nora tools
const MCP_TOOLS = [
  {
    name: "search_contact",
    description: "Search for contacts in GoHighLevel by email, phone, or name",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "Search term (email, phone, or name)" },
        limit: { type: "number", description: "Maximum number of results", default: 10 }
      },
      required: ["search"]
    }
  },
  {
    name: "create_contact",
    description: "Create a new contact in GoHighLevel",
    inputSchema: {
      type: "object",
      properties: {
        email: { type: "string", description: "Contact's email address" },
        firstName: { type: "string", description: "Contact's first name" },
        lastName: { type: "string", description: "Contact's last name" },
        phone: { type: "string", description: "Contact's phone number (optional)" },
        companyName: { type: "string", description: "Contact's company name (optional)" }
      },
      required: ["email", "firstName", "lastName"]
    }
  },
  {
    name: "update_contact",
    description: "Update an existing contact in GoHighLevel",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string", description: "Contact ID to update" },
        email: { type: "string", description: "Contact's email address" },
        firstName: { type: "string", description: "Contact's first name" },
        lastName: { type: "string", description: "Contact's last name" },
        phone: { type: "string", description: "Contact's phone number" },
        companyName: { type: "string", description: "Contact's company name" }
      },
      required: ["contactId"]
    }
  },
  {
    name: "delete_contact",
    description: "Delete a contact from GoHighLevel",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string", description: "Contact ID to delete" }
      },
      required: ["contactId"]
    }
  },
  {
    name: "upsert_contact",
    description: "Create or update a contact in GoHighLevel",
    inputSchema: {
      type: "object",
      properties: {
        email: { type: "string", description: "Contact's email address" },
        firstName: { type: "string", description: "Contact's first name" },
        lastName: { type: "string", description: "Contact's last name" },
        phone: { type: "string", description: "Contact's phone number (optional)" },
        companyName: { type: "string", description: "Contact's company name (optional)" }
      },
      required: ["email", "firstName", "lastName"]
    }
  },
  {
    name: "add_tag",
    description: "Add tags to a contact",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string", description: "Contact ID" },
        tags: { type: "array", items: { type: "string" }, description: "Tags to add" }
      },
      required: ["contactId", "tags"]
    }
  },
  {
    name: "remove_tag",
    description: "Remove tags from a contact",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string", description: "Contact ID" },
        tags: { type: "array", items: { type: "string" }, description: "Tags to remove" }
      },
      required: ["contactId", "tags"]
    }
  },
  {
    name: "get_task",
    description: "Get a specific task by ID",
    inputSchema: {
      type: "object",
      properties: {
        taskId: { type: "string", description: "Task ID" }
      },
      required: ["taskId"]
    }
  },
  {
    name: "create_task",
    description: "Create a new task for a contact",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string", description: "Contact ID" },
        title: { type: "string", description: "Task title" },
        description: { type: "string", description: "Task description (optional)" },
        dueDate: { type: "string", description: "Due date (ISO format, optional)" }
      },
      required: ["contactId", "title"]
    }
  },
  {
    name: "update_task",
    description: "Update an existing task",
    inputSchema: {
      type: "object",
      properties: {
        taskId: { type: "string", description: "Task ID" },
        title: { type: "string", description: "Task title" },
        description: { type: "string", description: "Task description" },
        dueDate: { type: "string", description: "Due date (ISO format)" },
        status: { type: "string", description: "Task status" }
      },
      required: ["taskId"]
    }
  },
  {
    name: "book_appointment",
    description: "Book an appointment for a contact",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string", description: "Contact ID" },
        calendarId: { type: "string", description: "Calendar ID" },
        startTime: { type: "string", description: "Start time (ISO format)" },
        endTime: { type: "string", description: "End time (ISO format)" },
        title: { type: "string", description: "Appointment title" },
        description: { type: "string", description: "Appointment description (optional)" }
      },
      required: ["contactId", "calendarId", "startTime", "endTime", "title"]
    }
  },
  {
    name: "get_appointments_for_contact",
    description: "Get all appointments for a contact",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string", description: "Contact ID" },
        startDate: { type: "string", description: "Start date (ISO format, optional)" },
        endDate: { type: "string", description: "End date (ISO format, optional)" }
      },
      required: ["contactId"]
    }
  },
  {
    name: "delete_appointment",
    description: "Delete an appointment",
    inputSchema: {
      type: "object",
      properties: {
        appointmentId: { type: "string", description: "Appointment ID" }
      },
      required: ["appointmentId"]
    }
  },
  {
    name: "send_sms",
    description: "Send an SMS message to a contact",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string", description: "Contact ID" },
        message: { type: "string", description: "Message content" }
      },
      required: ["contactId", "message"]
    }
  },
  {
    name: "send_email",
    description: "Send an email to a contact",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string", description: "Contact ID" },
        subject: { type: "string", description: "Email subject" },
        body: { type: "string", description: "Email body" }
      },
      required: ["contactId", "subject", "body"]
    }
  },
  {
    name: "update_conversation",
    description: "Update conversation notes for a contact",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string", description: "Contact ID" },
        notes: { type: "string", description: "Conversation notes" }
      },
      required: ["contactId", "notes"]
    }
  },
  {
    name: "create_opportunity",
    description: "Create a new opportunity for a contact",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string", description: "Contact ID" },
        title: { type: "string", description: "Opportunity title" },
        value: { type: "number", description: "Opportunity value (optional)" },
        pipelineId: { type: "string", description: "Pipeline ID (optional)" }
      },
      required: ["contactId", "title"]
    }
  },
  {
    name: "google_maps_scraper",
    description: "Scrape Google Maps data for a location",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        location: { type: "string", description: "Location to search in (optional)" }
      },
      required: ["query"]
    }
  },
  {
    name: "add_to_workflow",
    description: "Add a contact to a workflow",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string", description: "Contact ID" },
        workflowId: { type: "string", description: "Workflow ID" }
      },
      required: ["contactId", "workflowId"]
    }
  }
];

// Retry configuration for reliability
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2
};

/**
 * Enhanced MCP call function with retry logic
 */
async function makeMcpCall(endpoint: string, clientId: string, method: string = 'POST', body?: any, retryCount: number = 0): Promise<any> {
  const clientConfig = CLIENTS[clientId];
  if (!clientConfig) {
    throw new Error(`Client configuration not found for clientId: ${clientId}`);
  }

  console.log(`🚀 Making MCP call (attempt ${retryCount + 1}):`, {
    endpoint,
    method,
    clientId
  });

  try {
    const response = await fetch(`https://rest.gohighlevel.com/mcp/${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${clientConfig.pit}`,
        'locationId': clientConfig.locationId,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    
    console.log(`📥 MCP response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      const error = new Error(`HTTP ${response.status}: ${errorText}`);
      
      // Determine if error is retryable
      const isRetryable = response.status >= 500 || response.status === 429;
      
      if (isRetryable && retryCount < RETRY_CONFIG.maxRetries) {
        const delay = Math.min(
          RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount),
          RETRY_CONFIG.maxDelay
        );
        
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return makeMcpCall(endpoint, clientId, method, body, retryCount + 1);
      }
      
      throw error;
    }
    
    const result = await response.json();
    console.log('✅ MCP call successful');
    
    return result;
  } catch (error) {
    console.error(`❌ MCP call failed (attempt ${retryCount + 1}):`, error);
    
    if (retryCount < RETRY_CONFIG.maxRetries) {
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount),
        RETRY_CONFIG.maxDelay
      );
      
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return makeMcpCall(endpoint, clientId, method, body, retryCount + 1);
    }
    
    throw error;
  }
}

/**
 * Execute MCP tool based on tool name and parameters
 */
async function executeMcpTool(toolName: string, parameters: any, clientId: string = 'client_BG'): Promise<any> {
  console.log(`🔧 Executing MCP tool: ${toolName}`, parameters);

  switch (toolName) {
    case 'search_contact':
      return await makeMcpCall('contacts_get-contacts', clientId, 'GET', parameters);
    
    case 'create_contact':
      return await makeMcpCall('contacts_upsert-contact', clientId, 'POST', parameters);
    
    case 'update_contact':
      const { contactId, ...updateData } = parameters;
      return await makeMcpCall('contacts_update-contact', clientId, 'PUT', { contactId, ...updateData });
    
    case 'delete_contact':
      return await makeMcpCall(`contacts_delete-contact/${parameters.contactId}`, clientId, 'DELETE');
    
    case 'upsert_contact':
      return await makeMcpCall('contacts_upsert-contact', clientId, 'POST', parameters);
    
    case 'add_tag':
      return await makeMcpCall('contacts_add-tags', clientId, 'POST', parameters);
    
    case 'remove_tag':
      return await makeMcpCall('contacts_remove-tags', clientId, 'POST', parameters);
    
    case 'get_task':
      return await makeMcpCall(`contacts_get-all-tasks/${parameters.taskId}`, clientId, 'GET');
    
    case 'create_task':
      return await makeMcpCall('contacts_get-all-tasks', clientId, 'POST', parameters);
    
    case 'update_task':
      return await makeMcpCall(`contacts_get-all-tasks/${parameters.taskId}`, clientId, 'PUT', parameters);
    
    case 'book_appointment':
      return await makeMcpCall('calendars_get-calendar-events', clientId, 'POST', parameters);
    
    case 'get_appointments_for_contact':
      return await makeMcpCall('calendars_get-calendar-events', clientId, 'GET', parameters);
    
    case 'delete_appointment':
      return await makeMcpCall(`calendars_get-calendar-events/${parameters.appointmentId}`, clientId, 'DELETE');
    
    case 'send_sms':
      return await makeMcpCall('conversations_send-a-new-message', clientId, 'POST', parameters);
    
    case 'send_email':
      return await makeMcpCall('conversations_send-a-new-message', clientId, 'POST', {
        ...parameters,
        type: 'email'
      });
    
    case 'update_conversation':
      return await makeMcpCall('conversations_search-conversation', clientId, 'PUT', parameters);
    
    case 'create_opportunity':
      return await makeMcpCall('opportunities_search-opportunity', clientId, 'POST', parameters);
    
    case 'google_maps_scraper':
      // This would be a custom implementation
      return { message: 'Google Maps scraping not implemented yet' };
    
    case 'add_to_workflow':
      // This would be a custom implementation
      return { message: 'Workflow addition not implemented yet' };
    
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

/**
 * MCP Handler for n8n MCP Client node
 */
export async function mcpHandler(req: Request, res: Response) {
  try {
    console.log('🤖 MCP request received:', {
      method: req.method,
      url: req.url,
      body: req.body,
      headers: req.headers
    });

    // Handle different MCP request types
    const { type, tool, arguments: args, clientId = 'client_BG' } = req.body;

    switch (type) {
      case 'tools/list':
        // Return list of available tools
        res.json({
          tools: MCP_TOOLS.map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema
          }))
        });
        break;

      case 'tools/call':
        // Execute a specific tool
        if (!tool) {
          throw new Error('Tool name is required');
        }

        const result = await executeMcpTool(tool, args || {}, clientId);
        
        res.json({
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        });
        break;

      case 'ping':
        // Health check
        res.json({ pong: true });
        break;

      default:
        throw new Error(`Unknown MCP request type: ${type}`);
    }

  } catch (error) {
    console.error('❌ MCP handler error:', error);
    
    res.status(500).json({
      error: {
        type: 'error',
        text: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    });
  }
}

/**
 * SSE (Server-Sent Events) handler for MCP streaming
 */
export function mcpSseHandler(req: Request, res: Response) {
  console.log('📡 MCP SSE connection established');

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection message
  res.write('data: {"type":"connection","message":"MCP SSE connection established"}\n\n');

  // Handle client disconnect
  req.on('close', () => {
    console.log('📡 MCP SSE connection closed');
  });

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write('data: {"type":"ping"}\n\n');
  }, 30000);

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(keepAlive);
  });
}
