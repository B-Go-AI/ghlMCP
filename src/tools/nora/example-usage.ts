// src/tools/nora/example-usage.ts
// Example of how to use the createContact tool in a LangChain agent

import { createContact } from './tools/createContact.js';

/**
 * Example function showing how the createContact tool would be used
 * in a LangChain agent executor context
 */
export async function exampleCreateContact() {
  // Example JSON input that might come from a webhook
  const webhookData = {
    action: "create",
    clientId: "client_BG",
    contact: {
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      phone: "+1234567890", // Optional additional fields
      companyName: "Example Corp"
    }
  };

  try {
    // Call the createContact tool
    const result = await createContact({
      clientId: webhookData.clientId,
      contact: webhookData.contact
    });

    if (result.success) {
      console.log('✅ Contact created successfully:', {
        contactId: result.contactId,
        contact: result.contact
      });
      return result;
    } else {
      console.error('❌ Failed to create contact:', result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('❌ Error in createContact tool:', error);
    throw error;
  }
}

/**
 * Example of how this might be integrated into a LangChain tool
 */
export const createContactTool = {
  name: "createContact",
  description: "Creates a new contact in GoHighLevel for the specified client",
  parameters: {
    type: "object",
    properties: {
      clientId: {
        type: "string",
        description: "The client ID (e.g., 'client_BG')"
      },
      contact: {
        type: "object",
        properties: {
          email: {
            type: "string",
            description: "Contact's email address"
          },
          firstName: {
            type: "string",
            description: "Contact's first name"
          },
          lastName: {
            type: "string",
            description: "Contact's last name"
          },
          phone: {
            type: "string",
            description: "Contact's phone number (optional)"
          },
          companyName: {
            type: "string",
            description: "Contact's company name (optional)"
          }
        },
        required: ["email", "firstName", "lastName"]
      }
    },
    required: ["clientId", "contact"]
  },
  func: createContact
};

// Example usage in a LangChain agent setup
/*
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatOpenAI } from "@langchain/openai";
import { DynamicStructuredTool } from "@langchain/core/tools";

// Create the tool for LangChain
const createContactLangChainTool = new DynamicStructuredTool({
  name: "createContact",
  description: "Creates a new contact in GoHighLevel",
  schema: createContactTool.parameters,
  func: createContactTool.func,
});

// Use in agent
const tools = [createContactLangChainTool];
const llm = new ChatOpenAI({ temperature: 0 });
const agent = await createOpenAIFunctionsAgent({
  llm,
  tools,
  prompt: yourPrompt,
});
const agentExecutor = new AgentExecutor({ agent, tools });

// Execute
const result = await agentExecutor.invoke({
  input: "Create a contact for John Doe with email john@example.com for client_BG"
});
*/
