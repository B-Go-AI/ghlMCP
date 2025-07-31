// src/api/client-map.ts
// Client map for routing requests to correct GHL subaccounts

import { HighLevelApiClient } from "./client.js";
import { CLIENTS } from "../clients.js";

export interface ClientConfig {
  apiKey?: string;
  locationId: string;
  businessId?: string;
  name?: string;
  client_key?: string;
  pit?: string;
}

export interface SessionMapping {
  sessionKey: string;
  clientId: string;
  contactId?: string;
}

export class ClientMap {
  private clients: Map<string, HighLevelApiClient> = new Map();
  private configs: Map<string, ClientConfig> = new Map();
  private sessionMappings: Map<string, SessionMapping> = new Map();

  constructor() {
    this.loadDefaultClient();
  }

  /**
   * Load default client from environment variables and predefined clients
   */
  private loadDefaultClient(): void {
    const defaultApiKey = process.env.GHL_API_KEY;
    const defaultLocationId = process.env.GHL_LOCATION_ID;
    
    // Load default client from environment variables
    if (defaultApiKey && defaultLocationId) {
      this.addClient("default", {
        apiKey: defaultApiKey,
        locationId: defaultLocationId,
        name: "Default Client"
      });
    }
    
    // Load predefined clients
    for (const [clientId, config] of Object.entries(CLIENTS)) {
      this.addClient(clientId, {
        ...config,
        apiKey: defaultApiKey, // Use the same API key for all clients
        name: clientId
      });
    }
  }

  /**
   * Add a new client configuration
   */
  public addClient(clientId: string, config: ClientConfig): void {
    if (!config.apiKey) {
      console.warn(`No API key provided for client ${clientId}, skipping...`);
      return;
    }
    const client = new HighLevelApiClient(config.apiKey);
    this.clients.set(clientId, client);
    this.configs.set(clientId, config);
  }

  /**
   * Get client by ID
   */
  public getClient(clientId: string): HighLevelApiClient | undefined {
    return this.clients.get(clientId);
  }

  /**
   * Get client configuration by ID
   */
  public getConfig(clientId: string): ClientConfig | undefined {
    return this.configs.get(clientId);
  }

  /**
   * Add session mapping
   */
  public addSessionMapping(sessionKey: string, clientId: string, contactId?: string): void {
    this.sessionMappings.set(sessionKey, {
      sessionKey,
      clientId,
      contactId
    });
  }

  /**
   * Get client by session key
   */
  public getClientBySession(sessionKey: string): { client: HighLevelApiClient; config: ClientConfig; contactId?: string } | null {
    const mapping = this.sessionMappings.get(sessionKey);
    if (!mapping) return null;

    const client = this.clients.get(mapping.clientId);
    const config = this.configs.get(mapping.clientId);
    
    if (!client || !config) return null;

    return {
      client,
      config,
      contactId: mapping.contactId
    };
  }

  /**
   * Get client by contact identifier (email, phone, or contact ID)
   */
  public async getClientByContact(contactIdentifier: string): Promise<{ client: HighLevelApiClient; config: ClientConfig; contactId?: string } | null> {
    // Try to find by contact ID first
    for (const [clientId, config] of this.configs) {
      const client = this.clients.get(clientId);
      if (!client) continue;

      try {
        // Try to get contact by ID
        const contact = await client.request(`/contacts/${contactIdentifier}?locationId=${config.locationId}`);
        if (contact && typeof contact === 'object' && 
            ((contact as any).contact || ((contact as any).data && (contact as any).data.contact))) {
          return { client, config, contactId: contactIdentifier };
        }
      } catch (error) {
        // Contact not found by ID, continue to next client
      }
    }

    // Try to find by email or phone
    for (const [clientId, config] of this.configs) {
      const client = this.clients.get(clientId);
      if (!client) continue;

      try {
        // Search contacts by email or phone
        const searchParams = new URLSearchParams({
          locationId: config.locationId,
          query: contactIdentifier
        });
        
        const contacts = await client.request(`/contacts/?${searchParams.toString()}`);
        const contactList = contacts && typeof contacts === 'object' && 
          ((contacts as any).contacts || ((contacts as any).data && (contacts as any).data.contacts))
          ? ((contacts as any).contacts || (contacts as any).data?.contacts || [])
          : [];
        
        if (contactList.length > 0) {
          const contact = contactList[0];
          return { client, config, contactId: contact.id };
        }
      } catch (error) {
        // Search failed, continue to next client
      }
    }

    return null;
  }

  /**
   * Get default client
   */
  public getDefaultClient(): { client: HighLevelApiClient; config: ClientConfig } | null {
    const client = this.clients.get("default");
    const config = this.configs.get("default");
    
    if (!client || !config) return null;
    
    return { client, config };
  }

  /**
   * List all available clients
   */
  public listClients(): Array<{ id: string; config: ClientConfig }> {
    return Array.from(this.configs.entries()).map(([id, config]) => ({
      id,
      config
    }));
  }

  /**
   * Remove client
   */
  public removeClient(clientId: string): boolean {
    const clientRemoved = this.clients.delete(clientId);
    const configRemoved = this.configs.delete(clientId);
    
    // Remove any session mappings for this client
    for (const [sessionKey, mapping] of this.sessionMappings.entries()) {
      if (mapping.clientId === clientId) {
        this.sessionMappings.delete(sessionKey);
      }
    }
    
    return clientRemoved || configRemoved;
  }
} 