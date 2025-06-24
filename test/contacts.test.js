var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// test/contacts.test.ts
import { HighLevelApiClient } from "../src/api/client";
import { ContactsMCP } from "../src/api/contacts";
// Use API key and locationId from environment variables for security and flexibility
const apiKey = process.env.GHL_API_KEY || "";
const locationId = process.env.GHL_LOCATION_ID || "";
const client = new HighLevelApiClient(apiKey);
const contactsApi = new ContactsMCP(client);
let createdContactId;
// Helper to generate a unique email for each test run
const generateTestEmail = () => `test+${Date.now()}@example.com`;
describe("ContactsMCP", () => {
    it("should create, get, list, update, and delete a contact", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const contact = yield contactsApi.create({
                firstName: "Test",
                lastName: "User",
                email: generateTestEmail(),
                locationId,
            });
            expect(contact).toHaveProperty("id");
            createdContactId = contact.id;
        }
        catch (err) {
            console.error("Test failed: should create a contact");
            throw err;
        }
    }));
    it("should get the created contact", () => __awaiter(void 0, void 0, void 0, function* () {
        if (!createdContactId)
            return;
        try {
            const fetched = yield contactsApi.get(createdContactId, locationId);
            expect(fetched.id).toBe(createdContactId);
            expect(fetched.locationId).toBe(locationId);
        }
        catch (err) {
            console.error("Test failed: should get the created contact");
            throw err;
        }
    }));
    it("should list contacts", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const contacts = yield contactsApi.list(locationId);
            expect(Array.isArray(contacts)).toBe(true);
        }
        catch (err) {
            console.error("Test failed: should list contacts");
            throw err;
        }
    }));
    it("should update the created contact", () => __awaiter(void 0, void 0, void 0, function* () {
        if (!createdContactId)
            return;
        try {
            const updated = yield contactsApi.update(createdContactId, locationId, {
                firstName: "Updated",
            });
            expect(updated.firstName).toBe("Updated");
        }
        catch (err) {
            console.error("Test failed: should update the created contact");
            throw err;
        }
    }));
    it("should delete the created contact", () => __awaiter(void 0, void 0, void 0, function* () {
        if (!createdContactId)
            return;
        try {
            const deleted = yield contactsApi.delete(createdContactId, locationId);
            expect(deleted).toBe(true);
        }
        catch (err) {
            console.error("Test failed: should delete the created contact");
            throw err;
        }
    }));
    describe("upsertContact", () => {
        let upsertedContactId;
        const upsertEmail = `upsert+${Date.now()}@example.com`;
        it("should upsert a new contact (first call)", () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const contact = yield contactsApi.upsert({
                    firstName: "Upsert",
                    lastName: "Test",
                    email: upsertEmail,
                    locationId,
                });
                expect(contact).toHaveProperty("id");
                upsertedContactId = contact.id;
            }
            catch (err) {
                console.error("Test failed: should upsert a new contact (first call)");
                throw err;
            }
        }));
        it("should upsert the same contact (second call, not new)", () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const contact = yield contactsApi.upsert({
                    firstName: "Upsert",
                    lastName: "Test",
                    email: upsertEmail,
                    locationId,
                });
                expect(contact).toHaveProperty("id");
                expect(contact.id).toBe(upsertedContactId);
            }
            catch (err) {
                console.error("Test failed: should upsert the same contact (second call, not new)");
                throw err;
            }
        }));
        it("should delete the upserted contact", () => __awaiter(void 0, void 0, void 0, function* () {
            if (!upsertedContactId)
                return;
            try {
                const deleted = yield contactsApi.delete(upsertedContactId, locationId);
                expect(deleted).toBe(true);
            }
            catch (err) {
                console.error("Test failed: should delete the upserted contact");
                throw err;
            }
        }));
    });
    describe("getByBusinessId", () => {
        // Use a businessId from the environment for this test
        const testBusinessId = process.env.GHL_TEST_BUSINESS_ID || "";
        it("should get contacts by businessId", () => __awaiter(void 0, void 0, void 0, function* () {
            if (!testBusinessId) {
                console.warn("No GHL_TEST_BUSINESS_ID set in .env, skipping test.");
                return;
            }
            try {
                const contacts = yield contactsApi.getByBusinessId(testBusinessId, locationId, { limit: 2 });
                expect(Array.isArray(contacts)).toBe(true);
            }
            catch (err) {
                console.error("Test failed: should get contacts by businessId");
                throw err;
            }
        }));
    });
});
