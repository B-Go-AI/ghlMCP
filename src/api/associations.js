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
 * MCP wrapper for GoHighLevel Associations API
 */
export class AssociationsMCP {
    constructor(client) {
        this.client = client;
    }
    /**
     * Create a new association
     */
    createAssociation(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.client.request('/associations/', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { Version: '2021-07-28' },
            });
            if (res.data && res.data.id)
                return res.data;
            if (res.id)
                return res;
            throw new Error(res.message || 'Failed to create association');
        });
    }
    /**
     * Get all associations for a location
     */
    listAssociations(locationId_1) {
        return __awaiter(this, arguments, void 0, function* (locationId, skip = 0, limit = 100) {
            const params = new URLSearchParams({ locationId, skip: String(skip), limit: String(limit) });
            const res = yield this.client.request(`/associations/?${params.toString()}`, { headers: { Version: '2021-07-28' } });
            if (res.data && Array.isArray(res.data.associations))
                return res.data.associations;
            if (Array.isArray(res.associations))
                return res.associations;
            throw new Error(res.message || 'Failed to list associations');
        });
    }
    /**
     * Get association by ID
     */
    getAssociationById(associationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.client.request(`/associations/${associationId}`, { headers: { Version: '2021-07-28' } });
            if (res.data && res.data.id)
                return res.data;
            if (res.id)
                return res;
            throw new Error(res.message || 'Failed to fetch association by id');
        });
    }
    /**
     * Update association by ID
     */
    updateAssociation(associationId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.client.request(`/associations/${associationId}`, {
                method: 'PUT',
                body: JSON.stringify(data),
                headers: { Version: '2021-07-28' },
            });
            if (res.data && res.data.id)
                return res.data;
            if (res.id)
                return res;
            throw new Error(res.message || 'Failed to update association');
        });
    }
    /**
     * Delete association by ID
     */
    deleteAssociation(associationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.client.request(`/associations/${associationId}`, {
                method: 'DELETE',
                headers: { Version: '2021-07-28' },
            });
            if (res.data && res.data.deleted)
                return res.data;
            if (res.deleted)
                return res;
            throw new Error(res.message || 'Failed to delete association');
        });
    }
    /**
     * Create a new relation
     */
    createRelation(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.client.request('/associations/relations', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { Version: '2021-07-28' },
            });
            if (res.data && res.data.id)
                return res.data;
            if (res.id)
                return res;
            throw new Error(res.message || 'Failed to create relation');
        });
    }
    /**
     * Get all relations by recordId
     */
    getRelationsByRecordId(recordId_1, locationId_1) {
        return __awaiter(this, arguments, void 0, function* (recordId, locationId, skip = 0, limit = 100, associationIds) {
            const params = new URLSearchParams({ locationId, skip: String(skip), limit: String(limit) });
            if (associationIds && associationIds.length > 0) {
                associationIds.forEach(id => params.append('associationIds', id));
            }
            const res = yield this.client.request(`/associations/relations/${recordId}?${params.toString()}`, { headers: { Version: '2021-07-28' } });
            if (res.data && Array.isArray(res.data.relations))
                return res.data.relations;
            if (Array.isArray(res.relations))
                return res.relations;
            throw new Error(res.message || 'Failed to fetch relations by recordId');
        });
    }
    /**
     * Delete a relation by relationId
     */
    deleteRelation(relationId, locationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = new URLSearchParams({ locationId });
            const res = yield this.client.request(`/associations/relations/${relationId}?${params.toString()}`, {
                method: 'DELETE',
                headers: { Version: '2021-07-28' },
            });
            if (res.data && res.data.id)
                return res.data;
            if (res.id)
                return res;
            throw new Error(res.message || 'Failed to delete relation');
        });
    }
}
