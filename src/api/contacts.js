var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class ContactsMCP {
    constructor(client) {
        this.client = client;
    }
    /**
     * List all contacts
     */
    list(locationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const endpoint = locationId
                ? `/contacts/?locationId=${locationId}`
                : "/contacts";
            const res = yield this.client.request(endpoint);
            // Accept both legacy and real API response shapes
            if (Array.isArray(res.contacts))
                return res.contacts;
            if (res.data && Array.isArray(res.data.contacts))
                return res.data.contacts;
            throw new Error(res.message || "Failed to fetch contacts");
        });
    }
    /**
     * Get a contact by ID and locationId
     */
    get(contactId, locationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const endpoint = `/contacts/${contactId}?locationId=${locationId}`;
            const res = yield this.client.request(endpoint);
            // Accept both legacy and real API response shapes
            if (res.contact)
                return res.contact;
            if (res.data && res.data.contact)
                return res.data.contact;
            throw new Error(res.message || "Failed to fetch contact");
        });
    }
    /**
     * Create a new contact
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.client.request("/contacts/", {
                method: "POST",
                body: JSON.stringify(data),
            });
            if (res.contact)
                return res.contact;
            if (res.data && res.data.contact)
                return res.data.contact;
            throw new Error(res.message || "Failed to create contact");
        });
    }
    /**
     * Update a contact by ID and locationId
     */
    update(contactId, locationId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const endpoint = `/contacts/${contactId}?locationId=${locationId}`;
            const res = yield this.client.request(endpoint, {
                method: "PUT",
                body: JSON.stringify(data),
            });
            if (res.contact)
                return res.contact;
            if (res.data && res.data.contact)
                return res.data.contact;
            throw new Error(res.message || "Failed to update contact");
        });
    }
    /**
     * Delete a contact by ID and locationId
     */
    delete(contactId, locationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const endpoint = `/contacts/${contactId}?locationId=${locationId}`;
            const res = yield this.client.request(endpoint, {
                method: "DELETE",
            });
            // Accept both boolean and status-based responses
            if (res.status === "success" || res.statusCode === 200)
                return true;
            if (typeof res.success === "boolean")
                return res.success;
            return false;
        });
    }
    /**
     * Upsert a contact (create or update if exists)
     */
    upsert(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.client.request("/contacts/upsert", {
                method: "POST",
                body: JSON.stringify(data),
            });
            if (res.contact)
                return res.contact;
            if (res.data && res.data.contact)
                return res.data.contact;
            throw new Error(res.message || "Failed to upsert contact");
        });
    }
    /**
     * Get contacts by businessId
     * https://highlevel.stoplight.io/docs/integrations/8efc6d5a99417-get-contacts-by-business-id
     */
    getByBusinessId(businessId, locationId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = new URLSearchParams({ locationId });
            if (options === null || options === void 0 ? void 0 : options.limit)
                params.append("limit", String(options.limit));
            if (options === null || options === void 0 ? void 0 : options.skip)
                params.append("skip", String(options.skip));
            if (options === null || options === void 0 ? void 0 : options.query)
                params.append("query", options.query);
            const endpoint = `/contacts/business/${businessId}?${params.toString()}`;
            const res = yield this.client.request(endpoint);
            if (Array.isArray(res.contacts))
                return res.contacts;
            if (res.data && Array.isArray(res.data.contacts))
                return res.data.contacts;
            throw new Error(res.message || "Failed to fetch contacts by businessId");
        });
    }
}
