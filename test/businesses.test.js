var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// test/businesses.test.ts
import { HighLevelApiClient } from "../src/api/client";
import { BusinessesMCP } from "../src/api/businesses";
describe("BusinessesMCP", () => {
    const apiKey = process.env.GHL_API_KEY || "";
    const locationId = process.env.GHL_LOCATION_ID || "";
    const client = new HighLevelApiClient(apiKey);
    const businessesApi = new BusinessesMCP(client);
    let createdBusinessId;
    const generateTestBusinessName = () => `Test Business ${Date.now()}`;
    describe("create", () => {
        it("should create a business and then delete it", () => __awaiter(void 0, void 0, void 0, function* () {
            const payload = {
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
            let businessId;
            try {
                const res = yield businessesApi.create(payload);
                expect(res.success).toBe(true);
                expect(res.business).toHaveProperty("id");
                expect(res.business.name).toBe(payload.name);
                businessId = res.business.id;
                // Clean up
                const deleted = yield businessesApi.delete(businessId);
                expect(deleted).toBe(true);
            }
            catch (err) {
                console.error("Test failed: should create and delete a business");
                throw err;
            }
        }));
    });
    describe("getById", () => {
        it("should create, get by id, and delete a business", () => __awaiter(void 0, void 0, void 0, function* () {
            const payload = {
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
            let businessId;
            try {
                const res = yield businessesApi.create(payload);
                expect(res.success).toBe(true);
                businessId = res.business.id;
                const business = yield businessesApi.getById(businessId);
                expect(business).toHaveProperty("id", businessId);
                // Clean up
                const deleted = yield businessesApi.delete(businessId);
                expect(deleted).toBe(true);
            }
            catch (err) {
                console.error("Test failed: should create, get by id, and delete a business");
                throw err;
            }
        }));
    });
    describe("getByLocation", () => {
        it("should get businesses by locationId", () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const businesses = yield businessesApi.getByLocation(locationId);
                expect(Array.isArray(businesses)).toBe(true);
                if (businesses.length > 0) {
                    expect(businesses[0]).toHaveProperty("locationId", locationId);
                }
            }
            catch (err) {
                console.error("Test failed: should get businesses by locationId");
                throw err;
            }
        }));
    });
    describe("delete", () => {
        it("should create and then delete a business", () => __awaiter(void 0, void 0, void 0, function* () {
            const payload = {
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
            let businessId;
            try {
                const res = yield businessesApi.create(payload);
                expect(res.success).toBe(true);
                businessId = res.business.id;
                const deleted = yield businessesApi.delete(businessId);
                expect(deleted).toBe(true);
            }
            catch (err) {
                console.error("Test failed: should create and delete a business");
                throw err;
            }
        }));
    });
    describe("update", () => {
        it("should create, update, and delete a business", () => __awaiter(void 0, void 0, void 0, function* () {
            const payload = {
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
            let businessId;
            try {
                // Create
                const res = yield businessesApi.create(payload);
                expect(res.success).toBe(true);
                businessId = res.business.id;
                // Update
                const updatedName = payload.name + " Updated";
                const updated = yield businessesApi.update(businessId, {
                    name: updatedName,
                });
                expect(updated).toHaveProperty("id", businessId);
                expect(updated.name).toBe(updatedName);
                // Delete
                const deleted = yield businessesApi.delete(businessId);
                expect(deleted).toBe(true);
            }
            catch (err) {
                console.error("Test failed: should create, update, and delete a business");
                throw err;
            }
        }));
    });
    // Optionally, add more tests for other scenarios
});
