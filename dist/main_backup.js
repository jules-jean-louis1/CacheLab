"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const utils_1 = require("./utils/utils");
const authGuard_1 = require("./guard/authGuard");
const seedData_1 = require("./scripts/seedData");
const collection_1 = require("./classes/collection");
const database_1 = require("./classes/database");
const server = (0, fastify_1.default)({ logger: true });
const collection = new collection_1.Collection();
const database = new database_1.Database(collection);
// Charger des données initiales dans le hashMap
const initHashMap = collection.createHashMap("cart_user");
for (const entry of seedData_1.initialData) {
    initHashMap.addToHashMap(entry.key, entry.value);
}
server.post("/auth/login", async (request, reply) => {
    const token = (0, utils_1.getJWT)();
    return token.length
        ? reply.status(200).send({ success: true, token: token })
        : reply.status(404).send({ error: "No token generated." });
});
// newHashMap
server.post("/hashMap/new", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    const { name } = request.body;
    const newHashMap = collection.createHashMap(name);
    return { STATUS_CODES: 200, data: newHashMap };
});
// Collection
server.get("/hashMaps", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    const data = collection.getAll();
    return data;
});
// GetOneHashMap
server.get("/hashMap/:name", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    const { name } = request.params;
    if (!name)
        return;
    const data = collection.getHashMap(name);
    return data;
});
// Delete HashMap form a collection
server.delete("/hashMap/:name/", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    const { name } = request.params;
    collection.removeHashMap(name);
    return { STATUS_CODES: 200, message: name + "deleted" };
});
// Handler HashMap
server.post("/hashMap/:name/key/", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    const { name } = request.params;
    const getHashMap = collection.getHashMap(name);
    if (!getHashMap) {
        return { STATUS_CODES: 400 };
    }
    for (const [key, value] of Object.entries(request.body)) {
        getHashMap.HashMap.addToHashMap(key, value);
    }
    return {
        message: "Keys added successfully",
        data: collection.getHashMap(name),
    };
});
server.get("/hashMap/:name/keys/:key", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    const { key, name } = request.params;
    const getHashMap = collection.getHashMap(name);
    const keyFind = getHashMap.getKey(key);
    return {
        keyFind,
    };
});
server.get("/hashMap/:name/keys", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    const { name } = request.params;
    const getHashMap = collection.getHashMap(name);
    const dump = getHashMap.getAllData();
    return { dump, count: dump.length };
});
server.put("/hashMap/:name/keys/:key", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    const { key, name } = request.params;
    const getHashMap = collection.getHashMap(name);
    if (!getHashMap) {
        reply.code(404).send({ message: "HashMap not found." });
    }
    let updateItem;
    for (let [itemKey, value] of Object.entries(request.body)) {
        updateItem = getHashMap.addToHashMap(key, value);
    }
    reply.code(200).send(updateItem);
});
server.delete("/hashMap/:name/keys/:key", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    const { key, name } = request.params;
    const getHashMap = collection.getHashMap(name);
    if (!getHashMap) {
        reply.code(404).send({ message: "HashMap not found." });
    }
    const deleted = getHashMap.removeToHashMap(key);
    return deleted
        ? { message: "Key deleted successfully", key }
        : reply.status(404).send({ error: "Key not found" });
});
server.post("/hashMap/:name/save", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    const { name } = request.params;
    const getHashMap = collection.getHashMap(name);
    if (!getHashMap) {
        reply.code(404).send({ message: "HashMap not found." });
    }
    const save = database.save(name);
    if (save) {
        // Faire quelque chose
    }
});
server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
//# sourceMappingURL=main_backup.js.map