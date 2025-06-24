// test/associations.test.ts
import { HighLevelApiClient } from "../src/api/client";
import { AssociationsMCP } from "../src/api/associations";
import {
  CreateAssociationDto,
  UpdateAssociationDto,
  CreateRelationDto,
} from "../src/types";

describe("AssociationsMCP", () => {
  const apiKey = process.env.GHL_API_KEY || "";
  const locationId = process.env.GHL_LOCATION_ID || "";
  const client = new HighLevelApiClient(apiKey);
  const associationsApi = new AssociationsMCP(client);

  let createdAssociationId: string | undefined;
  let createdRelationId: string | undefined;

  const testAssociationKey = `test_key_${Date.now()}`;

  it("should create, get, update, and delete an association", async () => {
    // Create
    const createPayload: CreateAssociationDto = {
      locationId,
      key: testAssociationKey,
      firstObjectLabel: "TestLabel1",
      firstObjectKey: "custom_objects.test1",
      secondObjectLabel: "TestLabel2",
      secondObjectKey: "custom_objects.test2",
    };
    const created = await associationsApi.createAssociation(createPayload);
    expect(created).toHaveProperty("id");
    createdAssociationId = created.id;

    // Get by ID
    const fetched = await associationsApi.getAssociationById(
      createdAssociationId
    );
    expect(fetched).toHaveProperty("id", createdAssociationId);

    // Update
    const updatePayload: UpdateAssociationDto = {
      firstObjectLabel: "UpdatedLabel1",
      secondObjectLabel: "UpdatedLabel2",
    };
    const updated = await associationsApi.updateAssociation(
      createdAssociationId,
      updatePayload
    );
    expect(updated.firstObjectLabel).toBe("UpdatedLabel1");
    expect(updated.secondObjectLabel).toBe("UpdatedLabel2");

    // List
    const list = await associationsApi.listAssociations(locationId, 0, 10);
    expect(Array.isArray(list)).toBe(true);
    expect(list.find(a => a.id === createdAssociationId)).toBeTruthy();

    // Delete
    const deleted = await associationsApi.deleteAssociation(
      createdAssociationId
    );
    expect(deleted.deleted).toBe(true);
  });

  it("should create, get, and delete a relation", async () => {
    // Create a new association for the relation
    const assocPayload: CreateAssociationDto = {
      locationId,
      key: `rel_key_${Date.now()}`,
      firstObjectLabel: "RelLabel1",
      firstObjectKey: "custom_objects.rel1",
      secondObjectLabel: "RelLabel2",
      secondObjectKey: "custom_objects.rel2",
    };
    const assoc = await associationsApi.createAssociation(assocPayload);
    const associationId = assoc.id;

    // Create relation
    const createRelPayload: CreateRelationDto = {
      locationId,
      associationId,
      firstRecordId: "test_record_1", // Use real record IDs in integration
      secondRecordId: "test_record_2",
    };
    const relation = await associationsApi.createRelation(createRelPayload);
    expect(relation).toHaveProperty("id");
    createdRelationId = relation.id;

    // Get relations by recordId
    const relations = await associationsApi.getRelationsByRecordId(
      createRelPayload.firstRecordId,
      locationId,
      0,
      10,
      [associationId]
    );
    expect(Array.isArray(relations)).toBe(true);
    expect(relations.find(r => r.id === createdRelationId)).toBeTruthy();

    // Delete relation
    const deletedRel = await associationsApi.deleteRelation(
      createdRelationId,
      locationId
    );
    expect(deletedRel.id).toBe(createdRelationId);

    // Clean up association
    await associationsApi.deleteAssociation(associationId);
  });
});
