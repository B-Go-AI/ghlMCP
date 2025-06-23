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
