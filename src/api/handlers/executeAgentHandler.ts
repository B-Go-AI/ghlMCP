// src/api/handlers/executeAgentHandler.ts
// Enhanced agent execution handler for GHL MCP standard
// Optimized for n8n workflow reliability

import { Request, Response } from 'express';
import { z } from 'zod';
import { CLIENTS } from '../../clients.js';

// Enhanced request validation schema
const ExecuteAgentRequestSchema = z.object({
  agentName: z.string().describe('Name of the agent to execute (e.g., "nora")'),
  clientId: z.string().describe('Client ID for GHL subaccount routing'),
  input: z.string().describe('Natural language input for the agent to process'),
  retryCount: z.number().default(0).describe('Current retry attempt'),
  maxRetries: z.number().default(3).describe('Maximum retry attempts')
});

type ExecuteAgentRequest = z.infer<typeof ExecuteAgentRequestSchema>;

// Enhanced response interface
interface ExecuteAgentResponse {
  success: boolean;
  result?: any;
  error?: string;
  agentName: string;
  clientId: string;
  input: string;
  timestamp: string;
  responseTime: string;
  retryCount?: number;
  retryable?: boolean;
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2
};

/**
 * Enhanced MCP call function with retry logic and better error handling
 */
async function makeMcpCall(endpoint: string, clientId: string, method: string = 'POST', body?: any, retryCount: number = 0): Promise<any> {
  const clientConfig = CLIENTS[clientId];
  if (!clientConfig) {
    throw new Error(`Client configuration not found for clientId: ${clientId}`);
  }

  console.log(`🚀 Making MCP call (attempt ${retryCount + 1}):`, {
    endpoint,
    method,
    clientId,
    requestBody: body
  });

  try {
    const response = await fetch(`https://services.leadconnectorhq.com/${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
        'locationId': clientConfig.locationId,
        'Content-Type': 'application/json',
        'version': '2021-07-28'
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
    console.log('✅ MCP call successful:', result);
    
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
 * Enhanced agent runner with comprehensive tool support
 */
async function runAgent(agentName: string, clientId: string, input: string): Promise<any> {
  console.log(`🤖 Running agent: ${agentName} for client: ${clientId}`);
  console.log(`📝 Input: ${input}`);

  const lowerInput = input.toLowerCase();
  
  // Contact Management Tools
  if (lowerInput.includes('create a contact') || lowerInput.includes('add contact') || lowerInput.includes('new contact')) {
    console.log('📞 Detected contact creation request');
    const contactData = extractContactData(input);
    
    if (!contactData.email || !contactData.firstName || !contactData.lastName) {
      throw new Error('Contact creation requires email, firstName, and lastName');
    }
    
    // Use upsert endpoint which is more reliable for contact creation
    const result = await makeMcpCall('contacts/upsert', clientId, 'POST', contactData);
    return {
      action: 'create_contact',
      contact: result,
      message: `Contact created for ${contactData.firstName} ${contactData.lastName}`,
      contactId: result.id
    };
  }
  
  if (lowerInput.includes('search contact') || lowerInput.includes('find contact') || lowerInput.includes('get contact')) {
    console.log('🔍 Detected contact search request');
    const searchData = extractContactSearchData(input);
    
    const result = await makeMcpCall('contacts', clientId, 'GET', searchData);
    return {
      action: 'search_contact',
      contacts: result,
      message: `Found ${result.length} contacts`,
      count: result.length
    };
  }
  
  if (lowerInput.includes('update contact') || lowerInput.includes('modify contact') || lowerInput.includes('edit contact')) {
    console.log('✏️ Detected contact update request');
    const updateData = extractContactUpdateData(input);
    
    if (!updateData.contactId && !updateData.email) {
      throw new Error('Contact update requires contact ID or email');
    }
    
    let contactId = updateData.contactId;
    if (!contactId && updateData.email) {
      const contacts = await makeMcpCall('contacts', clientId, 'GET');
      const contact = contacts.find((c: any) => c.email === updateData.email);
      if (!contact) {
        throw new Error(`Contact not found with email: ${updateData.email}`);
      }
      contactId = contact.id;
    }
    
    const result = await makeMcpCall(`contacts/${contactId}`, clientId, 'PUT', updateData.data);
    return {
      action: 'update_contact',
      contact: result,
      message: `Contact updated successfully`,
      contactId
    };
  }
  
  // Communication Tools
  if (lowerInput.includes('send sms') || lowerInput.includes('send message') || lowerInput.includes('text message')) {
    console.log('💬 Detected SMS sending request');
    const smsData = extractSmsData(input);
    
    if (!smsData.phone || !smsData.message) {
      throw new Error('SMS sending requires phone number and message');
    }
    
    const result = await makeMcpCall('conversations/send-a-new-message', clientId, 'POST', smsData);
    return {
      action: 'send_sms',
      message: result,
      text: `SMS sent to ${smsData.phone}`,
      phone: smsData.phone
    };
  }
  
  // Task Management Tools
  if (lowerInput.includes('create task') || lowerInput.includes('add task') || lowerInput.includes('new task')) {
    console.log('📋 Detected task creation request');
    const taskData = extractTaskData(input);
    
    if (!taskData.title || !taskData.contactId) {
      throw new Error('Task creation requires title and contact ID');
    }
    
    const result = await makeMcpCall('contacts/get-all-tasks', clientId, 'POST', taskData);
    return {
      action: 'create_task',
      task: result,
      message: `Task created: ${taskData.title}`,
      taskId: result.id
    };
  }
  
  // Tag Management Tools
  if (lowerInput.includes('add tag') || lowerInput.includes('tag contact')) {
    console.log('🏷️ Detected tag addition request');
    const tagData = extractTagData(input);
    
    if (!tagData.contactId || !tagData.tags || tagData.tags.length === 0) {
      throw new Error('Tag addition requires contact ID and tags');
    }
    
    const result = await makeMcpCall('contacts/add-tags', clientId, 'POST', tagData);
    return {
      action: 'add_tag',
      result,
      message: `Tags added: ${tagData.tags.join(', ')}`,
      contactId: tagData.contactId,
      tags: tagData.tags
    };
  }
  
  if (lowerInput.includes('remove tag') || lowerInput.includes('delete tag')) {
    console.log('🏷️ Detected tag removal request');
    const tagData = extractTagData(input);
    
    if (!tagData.contactId || !tagData.tags || tagData.tags.length === 0) {
      throw new Error('Tag removal requires contact ID and tags');
    }
    
    const result = await makeMcpCall('contacts/remove-tags', clientId, 'POST', tagData);
    return {
      action: 'remove_tag',
      result,
      message: `Tags removed: ${tagData.tags.join(', ')}`,
      contactId: tagData.contactId,
      tags: tagData.tags
    };
  }
  
  // Calendar Tools
  if (lowerInput.includes('get calendar') || lowerInput.includes('calendar events') || lowerInput.includes('appointments')) {
    console.log('📅 Detected calendar request');
    const calendarData = extractCalendarData(input);
    
    const result = await makeMcpCall('calendars/get-calendar-events', clientId, 'GET', calendarData);
    return {
      action: 'get_calendar_events',
      events: result,
      message: `Found ${result.length} calendar events`,
      count: result.length
    };
  }
  
  // Opportunity Tools
  if (lowerInput.includes('create opportunity') || lowerInput.includes('add opportunity')) {
    console.log('💰 Detected opportunity creation request');
    const oppData = extractOpportunityData(input);
    
    if (!oppData.contactId || !oppData.title) {
      throw new Error('Opportunity creation requires contact ID and title');
    }
    
    const result = await makeMcpCall('opportunities/search-opportunity', clientId, 'POST', oppData);
    return {
      action: 'create_opportunity',
      opportunity: result,
      message: `Opportunity created: ${oppData.title}`,
      opportunityId: result.id
    };
  }
  
  // Default response for unrecognized patterns
  throw new Error(`Unrecognized action. Supported actions: create contact, search contact, update contact, send SMS, create task, add tag, remove tag, get calendar, create opportunity. Input: ${input}`);
}

// Enhanced data extraction functions
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

function extractContactSearchData(input: string): any {
  const data: any = {};
  
  // Extract search term
  const searchMatch = input.match(/(?:search|find|get)\s+(?:contact|contacts)\s+(?:for|with)\s+([A-Za-z0-9@.]+)/i);
  if (searchMatch) {
    data.search = searchMatch[1];
  }
  
  // Extract limit
  const limitMatch = input.match(/limit\s+(\d+)/i);
  if (limitMatch) {
    data.limit = parseInt(limitMatch[1]);
  }
  
  return data;
}

function extractContactUpdateData(input: string): any {
  const data: any = {};
  
  // Extract contact identifier
  const emailMatch = input.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    data.email = emailMatch[1];
  }
  
  const idMatch = input.match(/contact\s+(?:id\s+)?([a-zA-Z0-9]+)/i);
  if (idMatch) {
    data.contactId = idMatch[1];
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

function extractTaskData(input: string): any {
  const data: any = {};
  
  // Extract title
  const titleMatch = input.match(/(?:task|title)\s+(?:is\s+)?['"]([^'"]+)['"]/i);
  if (titleMatch) {
    data.title = titleMatch[1];
  }
  
  // Extract contact ID
  const contactMatch = input.match(/contact\s+(?:id\s+)?([a-zA-Z0-9]+)/i);
  if (contactMatch) {
    data.contactId = contactMatch[1];
  }
  
  return data;
}

function extractTagData(input: string): any {
  const data: any = {};
  
  // Extract contact ID
  const contactMatch = input.match(/contact\s+(?:id\s+)?([a-zA-Z0-9]+)/i);
  if (contactMatch) {
    data.contactId = contactMatch[1];
  }
  
  // Extract tags
  const tagsMatch = input.match(/tags?\s+['"]([^'"]+)['"]/i);
  if (tagsMatch) {
    data.tags = [tagsMatch[1]];
  }
  
  return data;
}

function extractCalendarData(input: string): any {
  const data: any = {};
  
  // Extract date range
  const dateMatch = input.match(/from\s+(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/i);
  if (dateMatch) {
    data.startDate = dateMatch[1];
    data.endDate = dateMatch[2];
  }
  
  return data;
}

function extractOpportunityData(input: string): any {
  const data: any = {};
  
  // Extract title
  const titleMatch = input.match(/(?:opportunity|title)\s+(?:is\s+)?['"]([^'"]+)['"]/i);
  if (titleMatch) {
    data.title = titleMatch[1];
  }
  
  // Extract contact ID
  const contactMatch = input.match(/contact\s+(?:id\s+)?([a-zA-Z0-9]+)/i);
  if (contactMatch) {
    data.contactId = contactMatch[1];
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
      inputLength: validatedRequest.input.length,
      retryCount: validatedRequest.retryCount
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
      responseTime: `${responseTime}ms`,
      retryCount: validatedRequest.retryCount
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
        responseTime: `${responseTime}ms`,
        retryCount: req.body?.retryCount || 0
      };
      
      res.status(400).json(response);
      return;
    }
    
    // Determine if error is retryable
    const isRetryable = error instanceof Error && 
      (error.message.includes('HTTP 5') || 
       error.message.includes('HTTP 429') ||
       error.message.includes('timeout') ||
       error.message.includes('network'));
    
    // Handle other errors
    const response: ExecuteAgentResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      agentName: req.body?.agentName || 'unknown',
      clientId: req.body?.clientId || 'unknown',
      input: req.body?.input || 'unknown',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      retryCount: req.body?.retryCount || 0,
      retryable: isRetryable
    };
    
    res.status(500).json(response);
  }
}
