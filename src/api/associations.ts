// src/api/associations.ts
// MCP wrapper for GoHighLevel Associations API
import { HighLevelApiClient } from "./client";
import {
  Association,
  CreateAssociationDto,
  UpdateAssociationDto,
  AssociationResponse,
  DeleteAssociationResponse,
  Relation,
  CreateRelationDto,
  RelationResponse,
} from "../types";

/**
 * MCP wrapper for GoHighLevel Associations API
 */
export class AssociationsMCP {
  private client: HighLevelApiClient;

  constructor(client: HighLevelApiClient) {
    this.client = client;
  }

  /**
   * Create a new association
   */
  public async createAssociation(
    data: CreateAssociationDto
  ): Promise<AssociationResponse> {
    const res = await this.client.request<AssociationResponse>(
      "/associations/",
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: { Version: "2021-07-28" },
      }
    );
    if (res.data && res.data.id) return res.data;
    if (res.id) return res as AssociationResponse;
    throw new Error(res.message || "Failed to create association");
  }

  /**
   * Get all associations for a location
   */
  public async listAssociations(
    locationId: string,
    skip = 0,
    limit = 100
  ): Promise<AssociationResponse[]> {
    const params = new URLSearchParams({
      locationId,
      skip: String(skip),
      limit: String(limit),
    });
    const res = await this.client.request<{
      associations: AssociationResponse[];
    }>(`/associations/?${params.toString()}`, {
      headers: { Version: "2021-07-28" },
    });
    if (res.data && Array.isArray(res.data.associations))
      return res.data.associations;
    if (Array.isArray(res.associations)) return res.associations;
    throw new Error(res.message || "Failed to list associations");
  }

  /**
   * Get association by ID
   */
  public async getAssociationById(
    associationId: string
  ): Promise<AssociationResponse> {
    const res = await this.client.request<AssociationResponse>(
      `/associations/${associationId}`,
      { headers: { Version: "2021-07-28" } }
    );
    if (res.data && res.data.id) return res.data;
    if (res.id) return res as AssociationResponse;
    throw new Error(res.message || "Failed to fetch association by id");
  }

  /**
   * Update association by ID
   */
  public async updateAssociation(
    associationId: string,
    data: UpdateAssociationDto
  ): Promise<AssociationResponse> {
    const res = await this.client.request<AssociationResponse>(
      `/associations/${associationId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { Version: "2021-07-28" },
      }
    );
    if (res.data && res.data.id) return res.data;
    if (res.id) return res as AssociationResponse;
    throw new Error(res.message || "Failed to update association");
  }

  /**
   * Delete association by ID
   */
  public async deleteAssociation(
    associationId: string
  ): Promise<DeleteAssociationResponse> {
    const res = await this.client.request<DeleteAssociationResponse>(
      `/associations/${associationId}`,
      {
        method: "DELETE",
        headers: { Version: "2021-07-28" },
      }
    );
    if (res.data && res.data.deleted) return res.data;
    if (res.deleted) return res as DeleteAssociationResponse;
    throw new Error(res.message || "Failed to delete association");
  }

  /**
   * Create a new relation
   */
  public async createRelation(
    data: CreateRelationDto
  ): Promise<RelationResponse> {
    const res = await this.client.request<RelationResponse>(
      "/associations/relations",
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: { Version: "2021-07-28" },
      }
    );
    if (res.data && res.data.id) return res.data;
    if (res.id) return res as RelationResponse;
    throw new Error(res.message || "Failed to create relation");
  }

  /**
   * Get all relations by recordId
   */
  public async getRelationsByRecordId(
    recordId: string,
    locationId: string,
    skip = 0,
    limit = 100,
    associationIds?: string[]
  ): Promise<RelationResponse[]> {
    const params = new URLSearchParams({
      locationId,
      skip: String(skip),
      limit: String(limit),
    });
    if (associationIds && associationIds.length > 0) {
      associationIds.forEach(id => params.append("associationIds", id));
    }
    const res = await this.client.request<{ relations: RelationResponse[] }>(
      `/associations/relations/${recordId}?${params.toString()}`,
      { headers: { Version: "2021-07-28" } }
    );
    if (res.data && Array.isArray(res.data.relations))
      return res.data.relations;
    if (Array.isArray(res.relations)) return res.relations;
    throw new Error(res.message || "Failed to fetch relations by recordId");
  }

  /**
   * Delete a relation by relationId
   */
  public async deleteRelation(
    relationId: string,
    locationId: string
  ): Promise<RelationResponse> {
    const params = new URLSearchParams({ locationId });
    const res = await this.client.request<RelationResponse>(
      `/associations/relations/${relationId}?${params.toString()}`,
      {
        method: "DELETE",
        headers: { Version: "2021-07-28" },
      }
    );
    if (res.data && res.data.id) return res.data;
    if (res.id) return res as RelationResponse;
    throw new Error(res.message || "Failed to delete relation");
  }
}
