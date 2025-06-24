var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * MCP wrapper for GoHighLevel Businesses API
 */
export class BusinessesMCP {
    constructor(client) {
        this.client = client;
    }
    /**
     * Create a new business
     * @param data Business creation payload
     * @returns The created business response
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("[BusinessesMCP.create] Request payload:", data);
                const res = yield this.client.request("/businesses/", {
                    method: "POST",
                    body: JSON.stringify(data),
                    headers: { Version: "2021-07-28" },
                });
                console.log("[BusinessesMCP.create] Raw API response:", res);
                // Accept both direct and nested response shapes
                if (res.data && res.data.success && res.data.business)
                    return res.data;
                if (res.success && res.business)
                    return res;
                throw new Error(res.message || "Failed to create business");
            }
            catch (err) {
                throw new Error(`Failed to create business: ${err instanceof Error ? err.message : String(err)}`);
            }
        });
    }
    /**
     * Get a business by its ID
     */
    getById(businessId) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.client.request(`/businesses/${businessId}`, { headers: { Version: "2021-07-28" } });
            if (res.business)
                return res.business;
            if (res.data && res.data.business)
                return res.data.business;
            throw new Error(res.message || "Failed to fetch business by id");
        });
    }
    /**
     * Get all businesses by locationId
     */
    getByLocation(locationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = new URLSearchParams({ locationId });
            const res = yield this.client.request(`/businesses/?${params.toString()}`, { headers: { Version: "2021-07-28" } });
            if (Array.isArray(res.businesses))
                return res.businesses;
            if (res.data && Array.isArray(res.data.businesses))
                return res.data.businesses;
            throw new Error(res.message || "Failed to fetch businesses by location");
        });
    }
    /**
     * Update a business by its ID
     */
    update(businessId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.client.request(`/businesses/${businessId}`, {
                method: "PUT",
                body: JSON.stringify(data),
                headers: { Version: "2021-07-28" },
            });
            if (res.business)
                return res.business;
            if (res.data && res.data.business)
                return res.data.business;
            throw new Error(res.message || "Failed to update business");
        });
    }
    /**
     * Delete a business by its ID
     */
    delete(businessId) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.client.request(`/businesses/${businessId}`, {
                method: "DELETE",
                headers: { Version: "2021-07-28" },
            });
            if (typeof res.success === "boolean")
                return res.success;
            if (res.data && typeof res.data.success === "boolean")
                return res.data.success;
            return false;
        });
    }
}
