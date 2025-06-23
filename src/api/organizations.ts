// src/api/organizations.ts
// HighLevel Organizations API wrapper
import { HighLevelApiClient } from "./client";

export interface Organization {
  /** Unique identifier for the organization (required) */
  id: string;
  /** Name of the organization (required) */
  name: string;
  /** Organization's address (optional) */
  address1?: string;
  /** Organization's secondary address (optional) */
  address2?: string;
  /** City (optional) */
  city?: string;
  /** State or province (optional) */
  state?: string;
  /** Postal/ZIP code (optional) */
  postalCode?: string;
  /** Country (optional) */
  country?: string;
  /** Organization's phone number (optional) */
  phone?: string;
  /** Organization's website (optional) */
  website?: string;
  /** Organization's email address (optional) */
  email?: string;
  /** Organization's time zone (optional) */
  timeZone?: string;
  /** Organization's industry (optional) */
  industry?: string;
  /** Organization's description (optional) */
  description?: string;
  /** Organization's logo URL (optional) */
  logoUrl?: string;
  /** Organization's created date (optional, ISO 8601) */
  createdAt?: string;
  /** Organization's last updated date (optional, ISO 8601) */
  updatedAt?: string;
  /** Organization's custom fields (optional, key-value pairs) */
  customFields?: Record<string, any>;
  // Add more fields as the API evolves, referencing the official GoHighLevel documentation
}

export class OrganizationsApi {
  private client: HighLevelApiClient;

  constructor(client: HighLevelApiClient) {
    this.client = client;
  }

  /**
   * List all organizations
   */
  public async list(): Promise<Organization[]> {
    const res = await this.client.request<{ organizations: Organization[] }>(
      "/organizations"
    );
    console.log("OrganizationsApi.list() response:", res); // Log the raw response for debugging
    if (Array.isArray(res.organizations)) return res.organizations;
    if (res.data && Array.isArray(res.data.organizations))
      return res.data.organizations;
    throw new Error(res.message || "Failed to fetch organizations");
  }

  /**
   * Get an organization by ID
   */
  public async get(id: string): Promise<Organization> {
    const res = await this.client.request<{ organization: Organization }>(
      `/organizations/${id}`
    );
    if (res.status === "success" && res.data) return res.data.organization;
    throw new Error(res.message || "Failed to fetch organization");
  }
}
