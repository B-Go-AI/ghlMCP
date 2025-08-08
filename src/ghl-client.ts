// Simple GHL API client
// Uses OAuth2 authentication like n8n

interface GHLConfig {
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  refreshToken?: string;
  locationId: string;
}

export class GHLClient {
  private config: GHLConfig;
  private baseUrl = 'https://services.leadconnectorhq.com';

  constructor(config: GHLConfig) {
    this.config = config;
  }

  private async getHeaders(): Promise<Record<string, string>> {
    // If we have an access token, use it
    if (this.config.accessToken) {
      return {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'locationId': this.config.locationId,
        'Content-Type': 'application/json',
        'version': '2021-07-28'
      };
    }

    // Otherwise, we need to get a token
    throw new Error('Access token required. Please implement OAuth2 flow.');
  }

  async createContact(contactData: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    const headers = await this.getHeaders();
    
    const response = await fetch(`${this.baseUrl}/contacts/upsert`, {
      method: 'POST',
      headers,
      body: JSON.stringify(contactData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GHL API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async searchContacts(email?: string) {
    const headers = await this.getHeaders();
    
    let url = `${this.baseUrl}/contacts`;
    if (email) {
      url += `?email=${encodeURIComponent(email)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GHL API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async updateContact(contactId: string, updateData: any) {
    const headers = await this.getHeaders();
    
    const response = await fetch(`${this.baseUrl}/contacts/${contactId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GHL API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async sendSMS(phone: string, message: string) {
    const headers = await this.getHeaders();
    
    const response = await fetch(`${this.baseUrl}/conversations/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        phone,
        message
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GHL API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }
}
