import { Collection } from "../classes/collection";
import { Database } from "../classes/database";
import { Validator } from "../utils/validation";
import { ResponseHandler } from "../utils/responseHandler";

describe("CacheLab API Tests", () => {
  let collection: Collection;
  let database: Database;

  beforeEach(() => {
    collection = new Collection();
    database = new Database(collection, { 
      autoSave: false,
      saveInterval: 0,
      backupCount: 0
    });
  });

  describe("Collection Management", () => {
    test("should create a new HashMap", () => {
      const hashMap = collection.createHashMap("test_map");
      expect(hashMap).toBeDefined();
      expect(collection.hasHashMap("test_map")).toBe(true);
    });

    test("should throw error for duplicate HashMap name", () => {
      collection.createHashMap("test_map");
      expect(() => {
        collection.createHashMap("test_map");
      }).toThrow("HashMap with name 'test_map' already exists");
    });

    test("should create HashMap with initial data", () => {
      const initialData = { key1: "value1", key2: "value2" };
      const hashMap = collection.createHashMap("test_map", initialData);
      
      const data = collection.getAllDataFromHashMap("test_map");
      expect(data).toHaveLength(2);
    });

    test("should get HashMap metadata", () => {
      collection.createHashMap("test_map");
      const metadata = collection.getHashMapMetadata("test_map");
      
      expect(metadata).toBeDefined();
      expect(metadata!.name).toBe("test_map");
      expect(metadata!.elementCount).toBe(0);
    });

    test("should rename HashMap", () => {
      collection.createHashMap("old_name");
      const success = collection.renameHashMap("old_name", "new_name");
      
      expect(success).toBe(true);
      expect(collection.hasHashMap("old_name")).toBe(false);
      expect(collection.hasHashMap("new_name")).toBe(true);
    });
  });

  describe("Key-Value Operations", () => {
    beforeEach(() => {
      collection.createHashMap("test_map");
    });

    test("should add key-value pair", () => {
      const success = collection.addToCollection("test_map", "key1", "value1");
      expect(success).toBe(true);
      
      const value = collection.getFromCollection("test_map", "key1");
      expect(value).toBe("value1");
    });

    test("should remove key-value pair", () => {
      collection.addToCollection("test_map", "key1", "value1");
      const success = collection.removeFromCollection("test_map", "key1");
      
      expect(success).toBe(true);
      
      const value = collection.getFromCollection("test_map", "key1");
      expect(value).toBeUndefined();
    });

    test("should get all data from HashMap", () => {
      collection.addToCollection("test_map", "key1", "value1");
      collection.addToCollection("test_map", "key2", "value2");
      
      const data = collection.getAllDataFromHashMap("test_map");
      expect(data).toHaveLength(2);
    });
  });

  describe("Validation", () => {
    test("should validate HashMap names", () => {
      const validResult = Validator.validateHashMapName("valid_name");
      expect(validResult.isValid).toBe(true);

      const invalidResult = Validator.validateHashMapName("");
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain("Name cannot be empty");
    });

    test("should validate keys", () => {
      const validResult = Validator.validateKey("valid_key");
      expect(validResult.isValid).toBe(true);

      const invalidResult = Validator.validateKey("");
      expect(invalidResult.isValid).toBe(false);
    });

    test("should validate values", () => {
      const validResult = Validator.validateValue("valid_value");
      expect(validResult.isValid).toBe(true);

      const invalidResult = Validator.validateValue(undefined);
      expect(invalidResult.isValid).toBe(false);
    });

    test("should validate HashMap data", () => {
      const validData = { key1: "value1", key2: 123 };
      const validResult = Validator.validateHashMapData(validData);
      expect(validResult.keys.isValid).toBe(true);
      expect(validResult.values.isValid).toBe(true);

      const invalidData = { "": "value1" };
      const invalidResult = Validator.validateHashMapData(invalidData);
      expect(invalidResult.keys.isValid).toBe(false);
    });
  });

  describe("Response Handlers", () => {
    test("should create success response", () => {
      const response = ResponseHandler.success({ data: "test" }, "Success message");
      
      expect(response.success).toBe(true);
      expect(response.message).toBe("Success message");
      expect(response.data).toEqual({ data: "test" });
      expect(response.statusCode).toBe(200);
    });

    test("should create error response", () => {
      const response = ResponseHandler.error("Error message", 400);
      
      expect(response.success).toBe(false);
      expect(response.error).toBe("Error message");
      expect(response.statusCode).toBe(400);
    });

    test("should create validation error response", () => {
      const errors = ["Error 1", "Error 2"];
      const response = ResponseHandler.validationError(errors);
      
      expect(response.success).toBe(false);
      expect(response.error).toBe("Validation failed");
      expect(response.statusCode).toBe(400);
      expect(response.details?.validationErrors).toEqual(errors);
    });
  });

  describe("Statistics", () => {
    test("should get collection statistics", () => {
      collection.createHashMap("map1");
      collection.createHashMap("map2");
      collection.addToCollection("map1", "key1", "value1");
      
      const stats = collection.getStats();
      
      expect(stats.totalHashMaps).toBe(2);
      expect(stats.totalElements).toBe(1);
    });

    test("should get all HashMaps data", () => {
      collection.createHashMap("map1");
      collection.createHashMap("map2");
      
      const data = collection.getAll();
      
      expect(data.totalHashMaps).toBe(2);
      expect(data.hashMaps).toHaveLength(2);
    });
  });

  describe("Serialization", () => {
    test("should serialize and deserialize collection", () => {
      collection.createHashMap("test_map");
      collection.addToCollection("test_map", "key1", "value1");
      collection.addToCollection("test_map", "key2", "value2");
      
      const serialized = collection.serialize();
      
      expect(serialized.metadata).toBeDefined();
      expect(serialized.hashMaps.test_map).toBeDefined();
      
      const newCollection = new Collection();
      const success = newCollection.deserialize(serialized);
      
      expect(success).toBe(true);
      expect(newCollection.hasHashMap("test_map")).toBe(true);
      
      const data = newCollection.getAllDataFromHashMap("test_map");
      expect(data).toHaveLength(2);
    });
  });
});

export {};