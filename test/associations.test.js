var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// test/associations.test.ts
import { HighLevelApiClient } from '../src/api/client';
import { AssociationsMCP } from '../src/api/associations';
describe('AssociationsMCP', () => {
    const apiKey = process.env.GHL_API_KEY || '';
    const locationId = process.env.GHL_LOCATION_ID || '';
    const client = new HighLevelApiClient(apiKey);
    const associationsApi = new AssociationsMCP(client);
    let createdAssociationId;
    let createdRelationId;
    const testAssociationKey = `test_key_${Date.now()}`;
    it('should create, get, update, and delete an association', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create
        const createPayload = {
            locationId,
            key: testAssociationKey,
            firstObjectLabel: 'TestLabel1',
            firstObjectKey: 'custom_objects.test1',
            secondObjectLabel: 'TestLabel2',
            secondObjectKey: 'custom_objects.test2',
        };
        const created = yield associationsApi.createAssociation(createPayload);
        expect(created).toHaveProperty('id');
        createdAssociationId = created.id;
        // Get by ID
        const fetched = yield associationsApi.getAssociationById(createdAssociationId);
        expect(fetched).toHaveProperty('id', createdAssociationId);
        // Update
        const updatePayload = {
            firstObjectLabel: 'UpdatedLabel1',
            secondObjectLabel: 'UpdatedLabel2',
        };
        const updated = yield associationsApi.updateAssociation(createdAssociationId, updatePayload);
        expect(updated.firstObjectLabel).toBe('UpdatedLabel1');
        expect(updated.secondObjectLabel).toBe('UpdatedLabel2');
        // List
        const list = yield associationsApi.listAssociations(locationId, 0, 10);
        expect(Array.isArray(list)).toBe(true);
        expect(list.find(a => a.id === createdAssociationId)).toBeTruthy();
        // Delete
        const deleted = yield associationsApi.deleteAssociation(createdAssociationId);
        expect(deleted.deleted).toBe(true);
    }));
    it('should create, get, and delete a relation', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a new association for the relation
        const assocPayload = {
            locationId,
            key: `rel_key_${Date.now()}`,
            firstObjectLabel: 'RelLabel1',
            firstObjectKey: 'custom_objects.rel1',
            secondObjectLabel: 'RelLabel2',
            secondObjectKey: 'custom_objects.rel2',
        };
        const assoc = yield associationsApi.createAssociation(assocPayload);
        const associationId = assoc.id;
        // Create relation
        const createRelPayload = {
            locationId,
            associationId,
            firstRecordId: 'test_record_1', // Use real record IDs in integration
            secondRecordId: 'test_record_2',
        };
        const relation = yield associationsApi.createRelation(createRelPayload);
        expect(relation).toHaveProperty('id');
        createdRelationId = relation.id;
        // Get relations by recordId
        const relations = yield associationsApi.getRelationsByRecordId(createRelPayload.firstRecordId, locationId, 0, 10, [associationId]);
        expect(Array.isArray(relations)).toBe(true);
        expect(relations.find(r => r.id === createdRelationId)).toBeTruthy();
        // Delete relation
        const deletedRel = yield associationsApi.deleteRelation(createdRelationId, locationId);
        expect(deletedRel.id).toBe(createdRelationId);
        // Clean up association
        yield associationsApi.deleteAssociation(associationId);
    }));
});
