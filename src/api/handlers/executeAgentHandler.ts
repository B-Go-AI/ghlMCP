// src/api/handlers/executeAgentHandler.ts
// Agent execution handler for GHL MCP standard
// Follows official GHL MCP documentation: https://help.gohighlevel.com/support/solutions/articles/48001255159

import { Request, Response } from 'express';
import { z } from 'zod';
import { CLIENTS } from '../../clients.js';

// Request validation schema for agent execution
const ExecuteAgentRequestSchema = z.object({
  agentName: z.string().describe('Name of the agent to execute (e.g., "nora")'),
  clientId: z.string().describe('Client ID for GHL subaccount routing'),
  input: z.string().describe('Natural language input for the agent to process')
});

type ExecuteAgentRequest = z.infer<typeof ExecuteAgentRequestSchema>;

// Response interface for agent execution
interface ExecuteAgentResponse {
  success: boolean;
  result?: any;
  error?: string;
  agentName: string;
  clientId: string;
  input: string;
  timestamp: string;
  responseTime: string;
}

/**
 * Run agent with the specified parameters
 * This function processes natural language input and maps it to appropriate MCP tools
 */
async function runAgent(agentName: string, clientId: string, input: string): Promise<any> {
  console.log(`🤖 Running agent: ${agentName} for client: ${clientId}`);
  console.log(`📝 Input: ${input}`);

  // Validate client exists
  const clientConfig = CLIENTS[clientId];
  if (!clientConfig) {
    throw new Error(`Client configuration not found for clientId: ${clientId}`);
  }

  // Helper function to make MCP API calls using JSON-RPC 2.0 protocol
  const makeMcpCall = async (method: string, params?: any) => {
    console.log('🚀 Making MCP call:', {
      method,
      params
    });

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const jsonRpcRequest = {
      jsonrpc: "2.0",
      method: method,
      id: requestId,
      params: params || {}
    };

    const response = await fetch('https://rest.gohighlevel.com/mcp', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${clientConfig.pit}`,
        'locationId': clientConfig.locationId,
        'Content-Type': 'application/json',
        'Accept': 'application/json,text/event-stream'
      },
      body: JSON.stringify(jsonRpcRequest)
    });
    
    console.log('📥 MCP response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    // Handle Server-Sent Events response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/event-stream')) {
      const text = await response.text();
      console.log('📥 Raw SSE response:', text);
      
      // Parse SSE format: "event: message\ndata: {...}"
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonData = line.substring(6); // Remove "data: " prefix
          try {
            const result = JSON.parse(jsonData);
            console.log('📥 Parsed SSE response:', result);
            
            if (result.error) {
              throw new Error(`JSON-RPC Error: ${result.error.message || result.error}`);
            }
            
            return result.result;
          } catch (parseError) {
            console.error('Failed to parse SSE data:', parseError);
            throw new Error(`Failed to parse SSE response: ${jsonData}`);
          }
        }
      }
      throw new Error('No valid data found in SSE response');
    } else {
      // Handle regular JSON response
      const result = await response.json();
      console.log('📥 JSON response body:', result);
      
      if (result.error) {
        throw new Error(`JSON-RPC Error: ${result.error.message || result.error}`);
      }
      
      return result.result;
    }
  };

  // Simple natural language processing to map input to MCP tools
  const lowerInput = input.toLowerCase();
  
  // Contact creation patterns
  if (lowerInput.includes('create a contact') || lowerInput.includes('add contact') || lowerInput.includes('new contact')) {
    console.log('📞 Detected contact creation request');
    
    // Extract contact information from input
    const contactData = extractContactData(input);
    
    if (!contactData.email || !contactData.firstName || !contactData.lastName) {
      throw new Error('Contact creation requires email, firstName, and lastName');
    }
    
         const result = await makeMcpCall('Create Contact', contactData);
    console.log('✅ Contact created successfully');
    return {
      action: 'create_contact',
      contact: result,
      message: `Contact created for ${contactData.firstName} ${contactData.lastName}`
    };
  }
  
  // SMS sending patterns
  if (lowerInput.includes('send sms') || lowerInput.includes('send message') || lowerInput.includes('text message')) {
    console.log('💬 Detected SMS sending request');
    
    const smsData = extractSmsData(input);
    
    if (!smsData.phone || !smsData.message) {
      throw new Error('SMS sending requires phone number and message');
    }
    
         const result = await makeMcpCall('Send Message', smsData);
    console.log('✅ SMS sent successfully');
    return {
      action: 'send_sms',
      message: result,
      text: `SMS sent to ${smsData.phone}`
    };
  }
  
  // Contact update patterns
  if (lowerInput.includes('update contact') || lowerInput.includes('modify contact') || lowerInput.includes('edit contact')) {
    console.log('✏️ Detected contact update request');
    
    const updateData = extractContactUpdateData(input);
    
    if (!updateData.contactId && !updateData.email) {
      throw new Error('Contact update requires contact ID or email');
    }
    
    // If email provided, first find the contact
    let contactId = updateData.contactId;
    if (!contactId && updateData.email) {
      const contacts = await makeMcpCall('List Contacts');
      const contact = contacts.find((c: any) => c.email === updateData.email);
      if (!contact) {
        throw new Error(`Contact not found with email: ${updateData.email}`);
      }
      contactId = contact.id;
    }
    
    const result = await makeMcpCall('Update Contact', { contactId, ...updateData.data });
    console.log('✅ Contact updated successfully');
    return {
      action: 'update_contact',
      contact: result,
      message: `Contact updated successfully`
    };
  }
  
  // Contact lookup patterns
  if (lowerInput.includes('find contact') || lowerInput.includes('get contact') || lowerInput.includes('lookup contact')) {
    console.log('🔍 Detected contact lookup request');
    
    const lookupData = extractContactLookupData(input);
    
    if (!lookupData.contactId && !lookupData.email) {
      throw new Error('Contact lookup requires contact ID or email');
    }
    
    let result;
    if (lookupData.contactId) {
      result = await makeMcpCall('Get Contact', { contactId: lookupData.contactId });
    } else {
      const contacts = await makeMcpCall('List Contacts');
      result = contacts.find((c: any) => c.email === lookupData.email);
      if (!result) {
        throw new Error(`Contact not found with email: ${lookupData.email}`);
      }
    }
    
    console.log('✅ Contact found successfully');
    return {
      action: 'get_contact',
      contact: result,
      message: `Contact found: ${result.firstName} ${result.lastName}`
    };
  }
  
  // Default response for unrecognized patterns
  throw new Error(`Unrecognized action. Supported actions: create contact, send SMS, update contact, find contact. Input: ${input}`);
}

/**
 * Extract contact data from natural language input
 */
function extractContactData(input: string): any {
  const data: any = {};
  
  // Extract name
  const nameMatch = input.match(/(?:named|for|contact)\s+([A-Za-z]+)\s+([A-Za-z]+)/i);
  if (nameMatch) {
    data.firstName = nameMatch[1];
    data.lastName = nameMatch[2];
  }
  
  // Extract email
  const emailMatch = input.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    data.email = emailMatch[1];
  }
  
  // Extract phone
  const phoneMatch = input.match(/(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/);
  if (phoneMatch) {
    data.phone = phoneMatch[1].replace(/[-.\s]/g, '');
  }
  
  return data;
}

/**
 * Extract SMS data from natural language input
 */
function extractSmsData(input: string): any {
  const data: any = {};
  
  // Extract phone number
  const phoneMatch = input.match(/(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/);
  if (phoneMatch) {
    data.phone = phoneMatch[1].replace(/[-.\s]/g, '');
  }
  
  // Extract message (text between quotes or after "message")
  const messageMatch = input.match(/message\s+['"]([^'"]+)['"]|['"]([^'"]+)['"]/);
  if (messageMatch) {
    data.message = messageMatch[1] || messageMatch[2];
  }
  
  return data;
}

/**
 * Extract contact update data from natural language input
 */
function extractContactUpdateData(input: string): any {
  const data: any = {};
  
  // Extract contact identifier
  const emailMatch = input.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    data.email = emailMatch[1];
  }
  
  // Extract update data
  const updateData: any = {};
  
  // Extract name updates
  const nameMatch = input.match(/(?:name|called)\s+(?:is\s+)?([A-Za-z]+)\s+([A-Za-z]+)/i);
  if (nameMatch) {
    updateData.firstName = nameMatch[1];
    updateData.lastName = nameMatch[2];
  }
  
  // Extract phone updates
  const phoneMatch = input.match(/(?:phone|number)\s+(?:is\s+)?(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/);
  if (phoneMatch) {
    updateData.phone = phoneMatch[1].replace(/[-.\s]/g, '');
  }
  
  data.data = updateData;
  return data;
}

/**
 * Extract contact lookup data from natural language input
 */
function extractContactLookupData(input: string): any {
  const data: any = {};
  
  // Extract email
  const emailMatch = input.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    data.email = emailMatch[1];
  }
  
  return data;
}

/**
 * Main handler for agent execution
 */
export async function executeAgentHandler(req: Request, res: Response) {
  const startTime = Date.now();
  
  try {
    console.log('🤖 Agent execution request received:', {
      method: req.method,
      url: req.url,
      body: req.body,
      headers: req.headers['content-type'],
      userAgent: req.headers['user-agent'],
      origin: req.headers['origin']
    });

    // Log environment variables for debugging
    console.log('🔍 Environment check:', {
      GHL_API_KEY: process.env.GHL_API_KEY ? '✅ Set' : '❌ Missing',
      GHL_LOCATION_ID_BG: process.env.GHL_LOCATION_ID_BG ? '✅ Set' : '❌ Missing',
      PIT_BG: process.env.PIT_BG ? '✅ Set' : '❌ Missing',
      NODE_ENV: process.env.NODE_ENV || 'development'
    });

    // Validate request
    const validatedRequest = ExecuteAgentRequestSchema.parse(req.body);
    
    console.log('✅ Agent request validated:', {
      agentName: validatedRequest.agentName,
      clientId: validatedRequest.clientId,
      inputLength: validatedRequest.input.length
    });
    
    // Execute the agent
    const result = await runAgent(
      validatedRequest.agentName,
      validatedRequest.clientId,
      validatedRequest.input
    );
    
    const responseTime = Date.now() - startTime;
    
    // Return success response
    const response: ExecuteAgentResponse = {
      success: true,
      result,
      agentName: validatedRequest.agentName,
      clientId: validatedRequest.clientId,
      input: validatedRequest.input,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`
    };
    
    console.log('📤 Agent execution response:', {
      success: response.success,
      agentName: response.agentName,
      action: result?.action,
      responseTime: response.responseTime
    });
    
    res.json(response);
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ Agent execution error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const response: ExecuteAgentResponse = {
        success: false,
        error: 'Validation error',
        agentName: req.body?.agentName || 'unknown',
        clientId: req.body?.clientId || 'unknown',
        input: req.body?.input || 'unknown',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`
      };
      
      res.status(400).json(response);
      return;
    }
    
    // Handle other errors
    const response: ExecuteAgentResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      agentName: req.body?.agentName || 'unknown',
      clientId: req.body?.clientId || 'unknown',
      input: req.body?.input || 'unknown',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`
    };
    
    res.status(500).json(response);
  }
}
