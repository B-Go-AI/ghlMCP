import express from "express";
import dotenv from "dotenv";
import { HighLevelApiClient } from "./api/client.js";
import { ContactsMCP } from "./api/contacts.js";

dotenv.config();

const app = express();
app.use(express.json());

// Example client map: sessionKey/contactId -> GHL API key
const clientMap: Record<string, string> = {
  // "sessionKeyOrContactId": "GHL_API_KEY_FOR_SUBACCOUNT",
  // Populate this map as needed
};

function getApiKeyFromRequest(req: express.Request): string {
  // 1. Prefer API key in header
  if (req.headers["ghl-api-key"]) return String(req.headers["ghl-api-key"]);
  // 2. Fallback to env
  if (process.env.GHL_API_KEY) return process.env.GHL_API_KEY;
  throw new Error("GHL_API_KEY is required in header or environment");
}

app.post("/execute-agent", async (req, res) => {
  try {
    // Accept sessionKey or contactId from n8n
    const { sessionKey, contactId, action, data } = req.body;
    if (!sessionKey && !contactId) {
      return res.status(400).json({ error: "Missing sessionKey or contactId" });
    }

    // Route to correct GHL subaccount using clientMap
    let apiKey = getApiKeyFromRequest(req);
    if (sessionKey && clientMap[sessionKey]) {
      apiKey = clientMap[sessionKey];
    } else if (contactId && clientMap[contactId]) {
      apiKey = clientMap[contactId];
    }

    const apiClient = new HighLevelApiClient(apiKey);
    const contactsApi = new ContactsMCP(apiClient);

    // Only allow basic contact actions for now
    let result;
    if (action === "create") {
      if (!data || !data.locationId) {
        return res.status(400).json({ error: "Missing contact data or locationId" });
      }
      result = await contactsApi.create(data);
    } else if (action === "update") {
      if (!data || !data.id || !data.locationId) {
        return res.status(400).json({ error: "Missing contact id, data, or locationId" });
      }
      const { id, locationId, ...updateData } = data;
      result = await contactsApi.update(id, locationId, updateData);
    } else {
      return res.status(400).json({ error: "Invalid or missing action (must be 'create' or 'update')" });
    }

    return res.json({ success: true, result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});
