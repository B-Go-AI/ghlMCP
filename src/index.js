var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { HighLevelApiClient } from "./api/client";
import { ContactsMCP } from "./api/contacts";
import { z } from "zod";
// Utility to get API key from env
const getApiKey = () => {
    const apiKey = process.env.GHL_API_KEY;
    if (!apiKey)
        throw new Error("GHL_API_KEY environment variable is required");
    return apiKey;
};
const apiClient = new HighLevelApiClient(getApiKey());
const contactsApi = new ContactsMCP(apiClient); // ✅ This matches the import
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
server.tool("listContacts", "List all contacts", { locationId: z.string().describe("Location ID") }, (_a) => __awaiter(void 0, [_a], void 0, function* ({ locationId }) {
    try {
        const contacts = yield contactsApi.list(locationId);
        return {
            content: [{ type: "text", text: JSON.stringify(contacts, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: `Error: ${err.message}` }],
        };
    }
}));
/**
 * Get a contact by ID
 */
server.tool("getContact", "Get a contact by ID", {
    id: z.string().describe("Contact ID"),
    locationId: z.string().describe("Location ID"),
}, (_a) => __awaiter(void 0, [_a], void 0, function* ({ id, locationId }) {
    try {
        const contact = yield contactsApi.get(id, locationId);
        return {
            content: [{ type: "text", text: JSON.stringify(contact, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: `Error: ${err.message}` }],
        };
    }
}));
/**
 * Create a new contact
 */
server.tool("createContact", "Create a new contact", {
    data: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        locationId: z.string(),
    }),
}, (_a) => __awaiter(void 0, [_a], void 0, function* ({ data }) {
    try {
        const contact = yield contactsApi.create(data);
        return {
            content: [{ type: "text", text: JSON.stringify(contact, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: `Error: ${err.message}` }],
        };
    }
}));
/**
 * Update a contact by ID
 */
server.tool("updateContact", "Update a contact by ID", {
    id: z.string(),
    locationId: z.string(),
    data: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
    }),
}, (_a) => __awaiter(void 0, [_a], void 0, function* ({ id, locationId, data }) {
    try {
        const contact = yield contactsApi.update(id, locationId, data);
        return {
            content: [{ type: "text", text: JSON.stringify(contact, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: `Error: ${err.message}` }],
        };
    }
}));
/**
 * Delete a contact by ID
 */
server.tool("deleteContact", "Delete a contact by ID", { id: z.string(), locationId: z.string() }, (_a) => __awaiter(void 0, [_a], void 0, function* ({ id, locationId }) {
    try {
        const result = yield contactsApi.delete(id, locationId);
        return {
            content: [
                { type: "text", text: result ? "Contact deleted" : "Delete failed" },
            ],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: `Error: ${err.message}` }],
        };
    }
}));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const transport = new StdioServerTransport();
        yield server.connect(transport);
        console.error("Weather MCP Server running on stdio");
    });
}
main().catch(error => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
