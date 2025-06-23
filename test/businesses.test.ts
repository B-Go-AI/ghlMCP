// test/businesses.test.ts
import { HighLevelApiClient } from "../src/api/client";
import { BusinessesMCP } from "../src/api/businesses";
import { CreateBusinessDto } from "../src/types";

describe("BusinessesMCP", () => {
  const apiKey = process.env.GHL_API_KEY || "";
  const locationId = process.env.GHL_LOCATION_ID || "";
  const client = new HighLevelApiClient(apiKey);
  const businessesApi = new BusinessesMCP(client);

  let createdBusinessId: string | undefined;

  const generateTestBusinessName = () => `Test Business ${Date.now()}`;

  describe("create", () => {
    it("should create a business", async () => {
      const payload: CreateBusinessDto = {
        name: generateTestBusinessName(),
        locationId,
        phone: "+1234567890", // Example phone
        email: `testbiz+${Date.now()}@example.com`,
        website: "https://example.com",
        address: "123 Main St",
        city: "Testville",
        postalCode: "12345",
        state: "TS",
        country: "US",
        description: "Automated test business",
      };
      try {
        const res = await businessesApi.create(payload);
        expect(res.success).toBe(true);
        expect(res.business).toHaveProperty("id");
        expect(res.business.name).toBe(payload.name);
        createdBusinessId = res.business.id;
      } catch (err) {
        console.error("Test failed: should create a business");
        throw err;
      }
    });
  });

  describe("getById", () => {
    it("should get a business by id", async () => {
      if (!createdBusinessId) return;
      try {
        const business = await businessesApi.getById(createdBusinessId);
        expect(business).toHaveProperty("id", createdBusinessId);
      } catch (err) {
        console.error("Test failed: should get a business by id");
        throw err;
      }
    });
  });

  describe("getByLocation", () => {
    it("should get businesses by locationId", async () => {
      try {
        const businesses = await businessesApi.getByLocation(locationId);
        expect(Array.isArray(businesses)).toBe(true);
        if (businesses.length > 0) {
          expect(businesses[0]).toHaveProperty("locationId", locationId);
        }
      } catch (err) {
        console.error("Test failed: should get businesses by locationId");
        throw err;
      }
    });
  });

  describe("delete", () => {
    it("should create and then delete a business", async () => {
      const payload: CreateBusinessDto = {
        name: generateTestBusinessName(),
        locationId,
        phone: "+1234567890",
        email: `testbiz+${Date.now()}@example.com`,
        website: "https://example.com",
        address: "123 Main St",
        city: "Testville",
        postalCode: "12345",
        state: "TS",
        country: "US",
        description: "Automated test business",
      };
      let businessId: string | undefined;
      try {
        const res = await businessesApi.create(payload);
        expect(res.success).toBe(true);
        businessId = res.business.id;
        const deleted = await businessesApi.delete(businessId);
        expect(deleted).toBe(true);
      } catch (err) {
        console.error("Test failed: should create and delete a business");
        throw err;
      }
    });
  });

  describe("update", () => {
    it("should create, update, and delete a business", async () => {
      const payload: CreateBusinessDto = {
        name: generateTestBusinessName(),
        locationId,
        phone: "+1234567890",
        email: `testbiz+${Date.now()}@example.com`,
        website: "https://example.com",
        address: "123 Main St",
        city: "Testville",
        postalCode: "12345",
        state: "TS",
        country: "US",
        description: "Automated test business",
      };
      let businessId: string | undefined;
      try {
        // Create
        const res = await businessesApi.create(payload);
        expect(res.success).toBe(true);
        businessId = res.business.id;
        // Update
        const updatedName = payload.name + " Updated";
        const updated = await businessesApi.update(businessId, {
          name: updatedName,
        });
        expect(updated).toHaveProperty("id", businessId);
        expect(updated.name).toBe(updatedName);
        // Delete
        const deleted = await businessesApi.delete(businessId);
        expect(deleted).toBe(true);
      } catch (err) {
        console.error(
          "Test failed: should create, update, and delete a business"
        );
        throw err;
      }
    });
  });

  // Optionally, add more tests for other scenarios
});
