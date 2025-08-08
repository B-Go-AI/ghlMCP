import { Request, Response } from 'express';
import { GHLClient } from '../ghl-client.js';

// Simple contact routes
export class ContactRoutes {
  private ghlClient: GHLClient;

  constructor(ghlClient: GHLClient) {
    this.ghlClient = ghlClient;
  }

  // Create a contact
  async createContact(req: Request, res: Response) {
    try {
      const { email, firstName, lastName, phone } = req.body;

      if (!email || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          error: 'email, firstName, and lastName are required'
        });
      }

      const contact = await this.ghlClient.createContact({
        email,
        firstName,
        lastName,
        phone
      });

      res.json({
        success: true,
        contact,
        message: `Contact created for ${firstName} ${lastName}`
      });

    } catch (error) {
      console.error('Create contact error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Search contacts
  async searchContacts(req: Request, res: Response) {
    try {
      const { email } = req.query;

      const contacts = await this.ghlClient.searchContacts(email as string);

      res.json({
        success: true,
        contacts,
        count: Array.isArray(contacts) ? contacts.length : 0
      });

    } catch (error) {
      console.error('Search contacts error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update a contact
  async updateContact(req: Request, res: Response) {
    try {
      const { contactId } = req.params;
      const updateData = req.body;

      if (!contactId) {
        return res.status(400).json({
          success: false,
          error: 'contactId is required'
        });
      }

      const contact = await this.ghlClient.updateContact(contactId, updateData);

      res.json({
        success: true,
        contact,
        message: 'Contact updated successfully'
      });

    } catch (error) {
      console.error('Update contact error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Send SMS
  async sendSMS(req: Request, res: Response) {
    try {
      const { phone, message } = req.body;

      if (!phone || !message) {
        return res.status(400).json({
          success: false,
          error: 'phone and message are required'
        });
      }

      const result = await this.ghlClient.sendSMS(phone, message);

      res.json({
        success: true,
        result,
        message: `SMS sent to ${phone}`
      });

    } catch (error) {
      console.error('Send SMS error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
