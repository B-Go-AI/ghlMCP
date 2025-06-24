// test/objects.test.ts
import { HighLevelApiClient } from "../src/api/client";
import { ObjectsMCP, CreateCustomObjectSchemaDto } from "../src/api/objects";

describe("ObjectsMCP", () => {
  const apiKey = process.env.GHL_API_KEY || "";
  const locationId = process.env.GHL_LOCATION_ID || "";
  const client = new HighLevelApiClient(apiKey);
  const objectsApi = new ObjectsMCP(client);

  let createdObjectKey: string | undefined;

  const testObjectKey = `custom_objects.test_${Date.now()}`;

  it("should create, get, and list custom object schemas", async () => {
    // Create
    const createPayload: CreateCustomObjectSchemaDto = {
      labels: { singular: "TestObj", plural: "TestObjs" },
      key: testObjectKey,
      description: "Test custom object",
      locationId,
      primaryDisplayPropertyDetails: {
        key: `${testObjectKey}.name`,
        name: "Name",
        dataType: "TEXT",
      },
    };
    const created = await objectsApi.createCustomObjectSchema(createPayload);
    expect(created).toHaveProperty("id");
    expect(created.key).toBe(testObjectKey);
    createdObjectKey = created.key;

    // Get by key
    const fetched = await objectsApi.getObjectSchemaByKey(
      createdObjectKey!,
      locationId
    );
    expect(fetched).toHaveProperty("id", created.id);
    expect(fetched.key).toBe(testObjectKey);

    // List all
    const list = await objectsApi.listObjects(locationId);
    expect(Array.isArray(list)).toBe(true);
    expect(list.find(o => o.key === createdObjectKey)).toBeTruthy();
  });

  it("should create, get, update, and delete a custom object record", async () => {
    if (!createdObjectKey) {
      // Create the object schema if not already created
      const createPayload: CreateCustomObjectSchemaDto = {
        labels: { singular: "TestObj", plural: "TestObjs" },
        key: testObjectKey,
        description: "Test custom object",
        locationId,
        primaryDisplayPropertyDetails: {
          key: `${testObjectKey}.name`,
          name: "Name",
          dataType: "TEXT",
        },
      };
      const created = await objectsApi.createCustomObjectSchema(createPayload);
      createdObjectKey = created.key;
      // Wait for propagation
      await new Promise(res => setTimeout(res, 2000)); // 2 seconds
    }
    let createdRecordId: string | undefined;
    let record: any;
    // Retry logic for record creation
    const maxRetries = 5; // Avoid magic numbers: 5 retries is a reasonable balance for propagation
    const retryDelayMs = 2000; // 2 seconds between retries
    let lastError: any;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const recordPayload = { locationId, properties: { name: "Test Name" } };
        record = await objectsApi.createCustomObjectRecord(
          createdObjectKey!,
          recordPayload
        );
        console.log("Create record response:", JSON.stringify(record, null, 2));
        if (record && record.id) {
          createdRecordId = record.id;
          break;
        }
        throw new Error("No id in record response");
      } catch (err) {
        lastError = err;
        if (attempt < maxRetries) {
          await new Promise(res => setTimeout(res, retryDelayMs));
        } else {
          throw lastError;
        }
      }
    }
    try {
      if (!createdObjectKey) throw new Error("createdObjectKey is undefined");
      if (!createdRecordId) throw new Error("createdRecordId is undefined");
      // Get record
      const fetched = await objectsApi.getCustomObjectRecordById(
        createdObjectKey,
        createdRecordId,
        locationId
      );
      console.log("Get record response:", JSON.stringify(fetched, null, 2));
      expect(fetched).toHaveProperty("id", createdRecordId);
      // Update record
      const updatePayload = { properties: { name: "Updated Name" } };
      const updated = await objectsApi.updateCustomObjectRecord(
        createdObjectKey,
        createdRecordId,
        updatePayload,
        locationId
      );
      console.log("Update record response:", JSON.stringify(updated, null, 2));
      expect(updated.properties.name).toBe("Updated Name");
    } finally {
      // Always attempt to delete the record if it was created
      if (createdRecordId) {
        try {
          const deleted = await objectsApi.deleteCustomObjectRecord(
            createdObjectKey!,
            createdRecordId
          );
          expect(deleted.id).toBe(createdRecordId);
          expect(deleted.success).toBe(true);
        } catch (err) {
          // Log but do not throw
          console.warn("Cleanup failed:", err);
        }
      }
    }
  });
});
