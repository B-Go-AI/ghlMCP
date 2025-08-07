// src/tools/nora/agentTools.ts
// Agent tools registration for LangChain integration

import { createContact } from './tools/createContact.js';

/**
 * Register all available tools for the LangChain agent
 */
export const agentTools = [
  {
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
  }
];

/**
 * Export individual tools for direct use
 */
export { createContact };

/**
 * Get tool by name
 */
export function getTool(name: string) {
  return agentTools.find(tool => tool.name === name);
}

/**
 * Get all available tool names
 */
export function getToolNames(): string[] {
  return agentTools.map(tool => tool.name);
}
