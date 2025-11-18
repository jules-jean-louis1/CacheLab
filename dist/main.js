"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const hashmap_1 = __importDefault(require("./classes/hashmap"));
const hasher_1 = require("./classes/hasher");
const indexCalculator_1 = require("./classes/indexCalculator");
const bucketManager_1 = require("./classes/bucketManager");
const resizeManager_1 = require("./classes/resizeManager");
const utils_1 = require("./utils/utils");
const authGuard_1 = require("./guard/authGuard");
const seedData_1 = require("./scripts/seedData");
const server = (0, fastify_1.default)({ logger: true });
const hasher = new hasher_1.Hasher();
const indexCalculator = new indexCalculator_1.IndexCalculator(hasher);
const bucketManager = new bucketManager_1.BucketManager();
const resizeManager = new resizeManager_1.ResizeManager();
const hashMapInstance = new hashmap_1.default(indexCalculator, bucketManager, resizeManager);
// Charger des données initiales dans le hashMap
for (const entry of seedData_1.initialData) {
    hashMapInstance.addToHashMap(entry.key, entry.value);
}
server.post("/auth/login", async (request, reply) => {
    const token = (0, utils_1.getJWT)();
    return token.length
        ? reply.status(200).send({ success: true, token: token })
        : reply.status(404).send({ error: "No token generated." });
});
server.get("/hashMap/length", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    const length = hashMapInstance.gethashMapLenght();
    return { hashMapLength: length };
});
server.get("/hashMap", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    const hashMap = hashMapInstance.gethashMap();
    return { hashMap: hashMap };
});
server.post("/key", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    for (const [key, value] of Object.entries(request.body)) {
        hashMapInstance.addToHashMap(key, value);
    }
    return {
        message: "Keys added successfully",
        hashMapState: hashMapInstance.gethashMap(),
    };
});
server.get("/keys/:key", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    const { key } = request.params;
    const keyFind = hashMapInstance.getKey(key);
    return {
        keyFind,
    };
});
server.get("/keys", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    const dump = hashMapInstance.getAllData();
    return { count: dump.length, dump };
});
server.put("/keys/:key", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    const { key } = request.params;
    let updateItem;
    for (let [itemKey, value] of Object.entries(request.body)) {
        updateItem = hashMapInstance.addToHashMap(key, value);
    }
    return updateItem;
});
server.delete("/keys/:key", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    const { key } = request.params;
    const deleted = hashMapInstance.removeToHashMap(key);
    return deleted
        ? { message: "Key deleted successfully", key }
        : reply.status(404).send({ error: "Key not found" });
});
server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
//# sourceMappingURL=main.js.map