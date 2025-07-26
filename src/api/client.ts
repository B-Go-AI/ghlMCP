// src/api/client.ts
// HighLevel API client for authentication and requests
// Use the built-in fetch API from Node.js 18+
// No import needed for fetch in Node.js 18+

import dotenv from "dotenv";
dotenv.config();

export interface HighLevelApiResponse<T> {
  status?: string;
  message?: string;
  data?: T;
  errors?: any;
  // Allow unknown fields for flexibility
  [key: string]: any;
}

export class HighLevelApiClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    apiKey?: string,
    baseUrl = "https://services.leadconnectorhq.com"
  ) {
    // Prefer explicit API key, then env location, then env agency
    this.apiKey =
      apiKey ||
      process.env.GHL_API_KEY_LOCATION ||
      process.env.GHL_API_KEY_AGENCY ||
      "";
    this.baseUrl = baseUrl;
    console.log("Using API key:", this.apiKey.slice(0, 6) + "...[REDACTED]");
  }

  /**
   * Get the correct API version header for a given endpoint
   */
  private getVersionHeader(endpoint: string): string | undefined {
    // Example: contacts endpoints require a version header
    if (endpoint.startsWith("/contacts")) return "2021-07-28";
    // Add more endpoint-specific version logic as needed
    return undefined;
  }

  /**
   * Make an authenticated request to the HighLevel API
   * @param endpoint API endpoint (e.g. '/contacts')
   * @param options Fetch options (method, body, etc.)
   */
  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<HighLevelApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const version = this.getVersionHeader(endpoint);
    // Convert options.headers to a plain object if needed
    let extraHeaders: Record<string, string> = {};
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          extraHeaders[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          extraHeaders[key] = value;
        });
      } else {
        extraHeaders = { ...options.headers } as Record<string, string>;
      }
    }
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      ...(version ? { Version: version } : {}),
      ...extraHeaders,
    };
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });
      // Handle empty response bodies gracefully
      const text = await response.text();
      let data: any = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (err) {
          return {
            status: "error",
            message: err instanceof Error ? err.message : String(err),
            errors: err,
          };
        }
      }
      if (!data.status && response.ok) data.status = "success";
      return data;
    } catch (err: any) {
      return { status: "error", message: err.message, errors: err };
    }
  }
}
