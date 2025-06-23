// src/api/businesses.ts
import { HighLevelApiClient } from "./client";
import { CreateBusinessDto, CreateBusinessResponse, Business } from "../types";

/**
 * MCP wrapper for GoHighLevel Businesses API
 */
export class BusinessesMCP {
  private client: HighLevelApiClient;

  constructor(client: HighLevelApiClient) {
    this.client = client;
  }

  /**
   * Create a new business
   * @param data Business creation payload
   * @returns The created business response
   */
  public async create(
    data: CreateBusinessDto
  ): Promise<CreateBusinessResponse> {
    try {
      console.log("[BusinessesMCP.create] Request payload:", data);
      const res = await this.client.request<CreateBusinessResponse>(
        "/businesses/",
        {
          method: "POST",
          body: JSON.stringify(data),
          headers: { Version: "2021-07-28" },
        }
      );
      console.log("[BusinessesMCP.create] Raw API response:", res);
      // Accept both direct and nested response shapes
      if (res.data && res.data.success && res.data.business) return res.data;
      if (res.success && res.business) return res as CreateBusinessResponse;
      throw new Error(res.message || "Failed to create business");
    } catch (err) {
      throw new Error(
        `Failed to create business: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }

  /**
   * Get a business by its ID
   */
  public async getById(businessId: string): Promise<Business> {
    const res = await this.client.request<{ business: Business }>(
      `/businesses/${businessId}`,
      { headers: { Version: "2021-07-28" } }
    );
    if (res.business) return res.business;
    if (res.data && res.data.business) return res.data.business;
    throw new Error(res.message || "Failed to fetch business by id");
  }

  /**
   * Get all businesses by locationId
   */
  public async getByLocation(locationId: string): Promise<Business[]> {
    const params = new URLSearchParams({ locationId });
    const res = await this.client.request<{ businesses: Business[] }>(
      `/businesses/?${params.toString()}`,
      { headers: { Version: "2021-07-28" } }
    );
    if (Array.isArray(res.businesses)) return res.businesses;
    if (res.data && Array.isArray(res.data.businesses))
      return res.data.businesses;
    throw new Error(res.message || "Failed to fetch businesses by location");
  }

  /**
   * Update a business by its ID
   */
  public async update(
    businessId: string,
    data: Partial<Business>
  ): Promise<Business> {
    const res = await this.client.request<{ business: Business }>(
      `/businesses/${businessId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { Version: "2021-07-28" },
      }
    );
    if (res.business) return res.business;
    if (res.data && res.data.business) return res.data.business;
    throw new Error(res.message || "Failed to update business");
  }

  /**
   * Delete a business by its ID
   */
  public async delete(businessId: string): Promise<boolean> {
    const res = await this.client.request<{ success: boolean }>(
      `/businesses/${businessId}`,
      {
        method: "DELETE",
        headers: { Version: "2021-07-28" },
      }
    );
    if (typeof res.success === "boolean") return res.success;
    if (res.data && typeof res.data.success === "boolean")
      return res.data.success;
    return false;
  }
}
