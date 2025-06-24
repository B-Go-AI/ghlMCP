// src/types/index.ts
// Centralized types for MCP server
export * from "../api/contacts";
// export * from "../api/organizations";
// export * from "../api/tasks";

/**
 * Business entity for GoHighLevel
 */
export interface Business {
  id: string; // Business Id
  name: string; // Business Name
  locationId: string; // Location Id
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  country?: string;
  description?: string;
  createdAt?: string; // ISO date
  updatedAt?: string; // ISO date
}

/**
 * Payload for creating a business
 */
export interface CreateBusinessDto {
  name: string;
  locationId: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  country?: string;
  description?: string;
}

/**
 * Response from creating a business
 */
export interface CreateBusinessResponse {
  success: boolean;
  business: Business;
}

/**
 * Association entity for GoHighLevel
 */
export interface Association {
  id: string;
  locationId: string;
  key: string;
  firstObjectLabel: string;
  firstObjectKey: string;
  secondObjectLabel: string;
  secondObjectKey: string;
  associationType: "USER_DEFINED" | "SYSTEM_DEFINED";
}

/**
 * Payload for creating an association
 */
export interface CreateAssociationDto {
  locationId: string;
  key: string;
  firstObjectLabel: string;
  firstObjectKey: string;
  secondObjectLabel: string;
  secondObjectKey: string;
}

/**
 * Payload for updating an association
 */
export interface UpdateAssociationDto {
  firstObjectLabel: string;
  secondObjectLabel: string;
}

/**
 * Response from association endpoints
 */
export interface AssociationResponse {
  id: string;
  locationId: string;
  key: string;
  firstObjectLabel: string;
  firstObjectKey: string;
  secondObjectLabel: string;
  secondObjectKey: string;
  associationType: "USER_DEFINED" | "SYSTEM_DEFINED";
}

/**
 * Response from deleting an association
 */
export interface DeleteAssociationResponse {
  deleted: boolean;
  id: string;
  message: string;
}

/**
 * Relation entity for GoHighLevel
 */
export interface Relation {
  id: string;
  locationId: string;
  associationId: string;
  firstRecordId: string;
  secondRecordId: string;
}

/**
 * Payload for creating a relation
 */
export interface CreateRelationDto {
  locationId: string;
  associationId: string;
  firstRecordId: string;
  secondRecordId: string;
}

/**
 * Response from relation endpoints
 */
export interface RelationResponse {
  id: string;
  locationId: string;
  associationId: string;
  firstRecordId: string;
  secondRecordId: string;
}
