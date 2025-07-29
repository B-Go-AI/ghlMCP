import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { HighLevelApiClient } from "./api/client.js";
import { ContactsMCP } from "./api/contacts";
import { z } from "zod";

// Utility to get API key from env
const getApiKey = (): string => {
  const apiKey = process.env.GHL_API_KEY;
  if (!apiKey) throw new Error("GHL_API_KEY environment variable is required");
  return apiKey;
};

const apiClient = new HighLevelApiClient(getApiKey());
const contactsApi = new ContactsMCP(apiClient);

const server = new McpServer({
  name: "weather",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

/**
 * List all contacts
 */
server.tool(
  "listContacts",
  "List all contacts",
  { locationId: z.string().describe("Location ID") },
  async ({ locationId }) => {
    try {
      const contacts = await contactsApi.list(locationId);
      return {
        content: [{ type: "text", text: JSON.stringify(contacts, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: ${(err as Error).message}` }],
      };
    }
  }
);

/**
 * Get a contact by ID
 */
server.tool(
  "getContact",
  "Get a contact by ID",
  {
    id: z.string().describe("Contact ID"),
    locationId: z.string().describe("Location ID"),
  },
  async ({ id, locationId }) => {
    try {
      const contact = await contactsApi.get(id, locationId);
      return {
        content: [{ type: "text", text: JSON.stringify(contact, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: ${(err as Error).message}` }],
      };
    }
  }
);

/**
 * Create a new contact
 */
server.tool(
  "createContact",
  "Create a new contact",
  {
    data: z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      locationId: z.string(),
    }),
  },
  async ({ data }) => {
    try {
      const contact = await contactsApi.create(data);
      return {
        content: [{ type: "text", text: JSON.stringify(contact, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: ${(err as Error).message}` }],
      };
    }
  }
);

/**
 * Update a contact by ID
 */
server.tool(
  "updateContact",
  "Update a contact by ID",
  {
    id: z.string(),
    locationId: z.string(),
    data: z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
    }),
  },
  async ({ id, locationId, data }) => {
    try {
      const contact = await contactsApi.update(id, locationId, data);
      return {
        content: [{ type: "text", text: JSON.stringify(contact, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: ${(err as Error).message}` }],
      };
    }
  }
);

/**
 * Delete a contact by ID
 */
server.tool(
  "deleteContact",
  "Delete a contact by ID",
  { id: z.string(), locationId: z.string() },
  async ({ id, locationId }) => {
    try {
      const result = await contactsApi.delete(id, locationId);
      return {
        content: [
          { type: "text", text: result ? "Contact deleted" : "Delete failed" },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: ${(err as Error).message}` }],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch(error => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
