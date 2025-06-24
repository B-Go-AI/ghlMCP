// src/api/objects.ts
// MCP wrapper for GoHighLevel Custom Objects API
import { HighLevelApiClient } from "./client";

export interface CustomObjectLabels {
  singular: string;
  plural: string;
}

export interface CreateCustomObjectSchemaDto {
  labels: CustomObjectLabels;
  key: string; // must be prefixed with 'custom_objects.'
  description?: string;
  locationId: string;
  primaryDisplayPropertyDetails: {
    key: string;
    name: string;
    dataType: "TEXT" | "NUMERICAL";
  };
}

export interface CustomObjectSchema {
  id: string;
  key: string;
  labels: CustomObjectLabels;
  description?: string;
  locationId: string;
  primaryDisplayProperty: string;
  dateAdded: string;
  dateUpdated: string;
  standard: boolean;
  type: "USER_DEFINED" | "SYSTEM_DEFINED";
}

export interface CustomObjectSchemaResponse {
  object: CustomObjectSchema;
}

export class ObjectsMCP {
  private client: HighLevelApiClient;

  constructor(client: HighLevelApiClient) {
    this.client = client;
  }

  /**
   * Create a new custom object schema
   */
  public async createCustomObjectSchema(
    data: CreateCustomObjectSchemaDto
  ): Promise<CustomObjectSchema> {
    const res = await this.client.request<CustomObjectSchemaResponse>(
      "/objects/",
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: { Version: "2021-07-28" },
      }
    );
    if (res.object) return res.object;
    if (res.data && res.data.object) return res.data.object;
    throw new Error(res.message || "Failed to create custom object schema");
  }

  /**
   * Get all objects for a location
   */
  public async listObjects(locationId: string): Promise<CustomObjectSchema[]> {
    const params = new URLSearchParams({ locationId });
    const res = await this.client.request<{ objects: CustomObjectSchema[] }>(
      `/objects/?${params.toString()}`,
      { headers: { Version: "2021-07-28" } }
    );
    if (Array.isArray(res.objects)) return res.objects;
    if (res.data && Array.isArray(res.data.objects)) return res.data.objects;
    throw new Error(res.message || "Failed to list objects");
  }

  /**
   * Get object schema by key
   */
  public async getObjectSchemaByKey(
    key: string,
    locationId: string
  ): Promise<CustomObjectSchema> {
    const params = new URLSearchParams({ locationId });
    const res = await this.client.request<{ object: CustomObjectSchema }>(
      `/objects/${key}?${params.toString()}`,
      { headers: { Version: "2021-07-28" } }
    );
    if (res.object) return res.object;
    if (res.data && res.data.object) return res.data.object;
    throw new Error(res.message || "Failed to get object schema by key");
  }

  /**
   * Create a new record for a custom object
   */
  public async createCustomObjectRecord(
    schemaKey: string,
    data: Record<string, any> & { locationId: string }
  ): Promise<any> {
    if (!data.locationId)
      throw new Error(
        "locationId is required to create a custom object record"
      );
    const res = await this.client.request<any>(
      `/objects/${schemaKey}/records`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: { Version: "2021-07-28" },
      }
    );
    if (res.record && res.record.id) return res.record;
    if (res.data && res.data.record && res.data.record.id)
      return res.data.record;
    throw new Error(res.message || "Failed to create custom object record");
  }

  /**
   * Get a record by id for a custom object
   */
  public async getCustomObjectRecordById(
    schemaKey: string,
    id: string,
    locationId: string
  ): Promise<any> {
    const params = new URLSearchParams({ locationId });
    const res = await this.client.request<any>(
      `/objects/${schemaKey}/records/${id}?${params.toString()}`,
      { headers: { Version: "2021-07-28" } }
    );
    if (res.record && res.record.id) return res.record;
    if (res.data && res.data.record && res.data.record.id)
      return res.data.record;
    throw new Error(res.message || "Failed to get custom object record by id");
  }

  /**
   * Update a record by id for a custom object
   */
  public async updateCustomObjectRecord(
    schemaKey: string,
    id: string,
    data: Record<string, any>,
    locationId: string
  ): Promise<any> {
    if (!locationId)
      throw new Error(
        "locationId is required to update a custom object record"
      );
    const params = new URLSearchParams({ locationId });
    const res = await this.client.request<any>(
      `/objects/${schemaKey}/records/${id}?${params.toString()}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { Version: "2021-07-28" },
      }
    );
    if (res.record && res.record.id) return res.record;
    if (res.data && res.data.record && res.data.record.id)
      return res.data.record;
    throw new Error(res.message || "Failed to update custom object record");
  }

  /**
   * Delete a record by id for a custom object
   */
  public async deleteCustomObjectRecord(
    schemaKey: string,
    id: string
  ): Promise<any> {
    const res = await this.client.request<any>(
      `/objects/${schemaKey}/records/${id}`,
      {
        method: "DELETE",
        headers: { Version: "2021-07-28" },
      }
    );
    if (res.id && res.success) return res;
    if (res.data && res.data.id && res.data.success) return res.data;
    throw new Error(res.message || "Failed to delete custom object record");
  }
}
