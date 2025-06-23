// src/api/contacts.ts
// HighLevel Contacts API wrapper
import { HighLevelApiClient } from "./client";

export interface Contact {
  /** Unique identifier for the contact (required) */
  id: string;
  /** First name of the contact (optional) */
  firstName?: string;
  /** Last name of the contact (optional) */
  lastName?: string;
  /** Email address (optional) */
  email?: string;
  /** Phone number (optional) */
  phone?: string;
  /** Date of birth (optional, ISO 8601 format) */
  dateOfBirth?: string;
  /** Contact's address (optional) */
  address1?: string;
  /** Contact's secondary address (optional) */
  address2?: string;
  /** City (optional) */
  city?: string;
  /** State or province (optional) */
  state?: string;
  /** Postal/ZIP code (optional) */
  postalCode?: string;
  /** Country (optional) */
  country?: string;
  /** Contact's company name (optional) */
  companyName?: string;
  /** Contact's website (optional) */
  website?: string;
  /** Contact's source (optional) */
  source?: string;
  /** Contact's tags (optional) */
  tags?: string[];
  /** Contact's DND (Do Not Disturb) status (optional) */
  dnd?: boolean;
  /** Contact's type (optional, e.g., 'lead', 'customer') */
  type?: string;
  /** Contact's owner user ID (optional) */
  ownerId?: string;
  /** Contact's time zone (optional) */
  timeZone?: string;
  /** Contact's custom fields (optional, key-value pairs) */
  customFields?: Record<string, any>;
  /** Contact creation date (optional, ISO 8601) */
  createdAt?: string;
  /** Contact last updated date (optional, ISO 8601) */
  updatedAt?: string;
  /** Contact's opt-in status for email (optional) */
  emailOptOut?: boolean;
  /** Contact's opt-in status for SMS (optional) */
  smsOptOut?: boolean;
  /** Contact's opt-in status for calls (optional) */
  callOptOut?: boolean;
  /** Contact's opt-in status for ringless voicemail (optional) */
  ringlessVoicemailOptOut?: boolean;
  /** Contact's opt-in status for WhatsApp (optional) */
  whatsappOptOut?: boolean;
  /** Contact's Facebook page ID (optional) */
  facebookPageId?: string;
  /** Contact's Facebook lead ID (optional) */
  facebookLeadId?: string;
  /** Contact's location ID (optional) */
  locationId?: string;
  /** Contact's organization ID (optional) */
  organizationId?: string;
  /** Contact's pipeline ID (optional) */
  pipelineId?: string;
  /** Contact's stage ID (optional) */
  stageId?: string;
  /** Contact's assigned user IDs (optional) */
  assignedUserIds?: string[];
  /** Contact's avatar URL (optional) */
  avatarUrl?: string;
  /** Contact's notes (optional) */
  notes?: string;
  // Add more fields as the API evolves, referencing the official GoHighLevel documentation
}

export class ContactsApi {
  private client: HighLevelApiClient;

  constructor(client: HighLevelApiClient) {
    this.client = client;
  }

  /**
   * List all contacts
   */
  public async list(locationId?: string): Promise<Contact[]> {
    const endpoint = locationId
      ? `/contacts/?locationId=${locationId}`
      : "/contacts";
    const res = await this.client.request<{ contacts: Contact[] }>(endpoint);
    console.log("ContactsApi.list() response:", res); // Log the raw response for debugging
    // Accept both legacy and real API response shapes
    if (Array.isArray(res.contacts)) return res.contacts;
    if (res.data && Array.isArray(res.data.contacts)) return res.data.contacts;
    throw new Error(res.message || "Failed to fetch contacts");
  }

  /**
   * Get a contact by ID and locationId
   */
  public async get(contactId: string, locationId: string): Promise<Contact> {
    const endpoint = `/contacts/${contactId}?locationId=${locationId}`;
    const res = await this.client.request<{ contact: Contact }>(endpoint);
    // Accept both legacy and real API response shapes
    if (res.contact) return res.contact;
    if (res.data && res.data.contact) return res.data.contact;
    throw new Error(res.message || "Failed to fetch contact");
  }

  /**
   * Create a new contact
   */
  public async create(
    data: Partial<Contact> & { locationId: string }
  ): Promise<Contact> {
    const res = await this.client.request<{ contact: Contact }>("/contacts/", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.contact) return res.contact;
    if (res.data && res.data.contact) return res.data.contact;
    throw new Error(res.message || "Failed to create contact");
  }

  /**
   * Update a contact by ID and locationId
   */
  public async update(
    contactId: string,
    locationId: string,
    data: Partial<Contact>
  ): Promise<Contact> {
    const endpoint = `/contacts/${contactId}?locationId=${locationId}`;
    const res = await this.client.request<{ contact: Contact }>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (res.contact) return res.contact;
    if (res.data && res.data.contact) return res.data.contact;
    throw new Error(res.message || "Failed to update contact");
  }

  /**
   * Delete a contact by ID and locationId
   */
  public async delete(contactId: string, locationId: string): Promise<boolean> {
    const endpoint = `/contacts/${contactId}?locationId=${locationId}`;
    const res = await this.client.request(endpoint, {
      method: "DELETE",
    });
    // Accept both boolean and status-based responses
    if (res.status === "success" || res.statusCode === 200) return true;
    if (typeof res.success === "boolean") return res.success;
    return false;
  }

  /**
   * Upsert a contact (create or update if exists)
   */
  public async upsert(
    data: Partial<Contact> & { locationId: string }
  ): Promise<Contact> {
    const res = await this.client.request<{ contact: Contact }>(
      "/contacts/upsert",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    if (res.contact) return res.contact;
    if (res.data && res.data.contact) return res.data.contact;
    throw new Error(res.message || "Failed to upsert contact");
  }

  /**
   * Get contacts by businessId
   * https://highlevel.stoplight.io/docs/integrations/8efc6d5a99417-get-contacts-by-business-id
   */
  public async getByBusinessId(
    businessId: string,
    locationId: string,
    options?: { limit?: number; skip?: number; query?: string }
  ): Promise<Contact[]> {
    const params = new URLSearchParams({ locationId });
    if (options?.limit) params.append("limit", String(options.limit));
    if (options?.skip) params.append("skip", String(options.skip));
    if (options?.query) params.append("query", options.query);
    const endpoint = `/contacts/business/${businessId}?${params.toString()}`;
    const res = await this.client.request<{ contacts: Contact[] }>(endpoint);
    if (Array.isArray(res.contacts)) return res.contacts;
    if (res.data && Array.isArray(res.data.contacts)) return res.data.contacts;
    throw new Error(res.message || "Failed to fetch contacts by businessId");
  }
}
