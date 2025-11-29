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
const validation_1 = require("./utils/validation");
const responseHandler_1 = require("./utils/responseHandler");
const server = (0, fastify_1.default)({ logger: true });
// Initialisation
const collection = new collection_1.Collection();
const database = new database_1.Database(collection, {
    autoSave: true,
    saveInterval: 300000, // 5 minutes
    backupCount: 5,
    compression: false
});
// Charger les données initiales
try {
    const initHashMap = collection.createHashMap("cart_user", Object.fromEntries(seedData_1.initialData.map(entry => [entry.key, entry.value])));
    console.log("Initial data loaded successfully");
}
catch (error) {
    console.error("Error loading initial data:", error);
}
// Middleware de gestion des erreurs globales
server.setErrorHandler((error, request, reply) => {
    const errorResponse = responseHandler_1.ErrorHandler.handleError(error);
    reply.status(errorResponse.statusCode).send(errorResponse);
});
// ==== AUTHENTICATION ====
server.post("/auth/login", async (request, reply) => {
    const token = (0, utils_1.getJWT)();
    const response = token.length
        ? responseHandler_1.ResponseHandler.success({ token }, "Login successful")
        : responseHandler_1.ResponseHandler.error("Failed to generate token", 500);
    reply.status(response.statusCode).send(response);
});
// ==== COLLECTION MANAGEMENT ====
// Créer une nouvelle HashMap
server.post("/hashMap", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    try {
        const validation = validation_1.Validator.validateRequest(request.body, ['name']);
        if (!validation.isValid) {
            const response = responseHandler_1.ResponseHandler.validationError(validation.errors);
            return reply.status(response.statusCode).send(response);
        }
        const { name, initialData } = request.body;
        const nameValidation = validation_1.Validator.validateHashMapName(name);
        if (!nameValidation.isValid) {
            const response = responseHandler_1.ResponseHandler.validationError(nameValidation.errors);
            return reply.status(response.statusCode).send(response);
        }
        // Valider les données initiales si fournies
        if (initialData) {
            const dataValidation = validation_1.Validator.validateHashMapData(initialData);
            if (!dataValidation.keys.isValid || !dataValidation.values.isValid) {
                const errors = [...dataValidation.keys.errors, ...dataValidation.values.errors];
                const response = responseHandler_1.ResponseHandler.validationError(errors);
                return reply.status(response.statusCode).send(response);
            }
        }
        const newHashMap = collection.createHashMap(name, initialData);
        const metadata = collection.getHashMapMetadata(name);
        const response = responseHandler_1.ResponseHandler.success({ hashMap: metadata }, `HashMap '${name}' created successfully`, 201);
        reply.status(response.statusCode).send(response);
    }
    catch (error) {
        if (error instanceof Error && error.message.includes('already exists')) {
            const response = responseHandler_1.ResponseHandler.conflict(`HashMap '${request.body.name}'`);
            return reply.status(response.statusCode).send(response);
        }
        const response = responseHandler_1.ErrorHandler.handleError(error, 'createHashMap');
        reply.status(response.statusCode).send(response);
    }
});
// Lister toutes les HashMaps
server.get("/hashMaps", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    try {
        const data = collection.getAll();
        const response = responseHandler_1.ResponseHandler.success(data, "HashMaps retrieved successfully");
        reply.status(response.statusCode).send(response);
    }
    catch (error) {
        const response = responseHandler_1.ErrorHandler.handleError(error, 'listHashMaps');
        reply.status(response.statusCode).send(response);
    }
});
// Obtenir une HashMap spécifique
server.get("/hashMap/:name", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    try {
        const { name } = request.params;
        const nameValidation = validation_1.Validator.validateHashMapName(name);
        if (!nameValidation.isValid) {
            const response = responseHandler_1.ResponseHandler.validationError(nameValidation.errors);
            return reply.status(response.statusCode).send(response);
        }
        const metadata = collection.getHashMapMetadata(name);
        if (!metadata) {
            const response = responseHandler_1.ResponseHandler.notFound(`HashMap '${name}'`);
            return reply.status(response.statusCode).send(response);
        }
        const data = collection.getAllDataFromHashMap(name);
        const response = responseHandler_1.ResponseHandler.success({ metadata, data }, `HashMap '${name}' retrieved successfully`);
        reply.status(response.statusCode).send(response);
    }
    catch (error) {
        const response = responseHandler_1.ErrorHandler.handleError(error, 'getHashMap');
        reply.status(response.statusCode).send(response);
    }
});
// Supprimer une HashMap
server.delete("/hashMap/:name", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    try {
        const { name } = request.params;
        const nameValidation = validation_1.Validator.validateHashMapName(name);
        if (!nameValidation.isValid) {
            const response = responseHandler_1.ResponseHandler.validationError(nameValidation.errors);
            return reply.status(response.statusCode).send(response);
        }
        if (!collection.hasHashMap(name)) {
            const response = responseHandler_1.ResponseHandler.notFound(`HashMap '${name}'`);
            return reply.status(response.statusCode).send(response);
        }
        const success = collection.removeHashMap(name);
        if (success) {
            const response = responseHandler_1.ResponseHandler.success(null, `HashMap '${name}' deleted successfully`);
            reply.status(response.statusCode).send(response);
        }
        else {
            const response = responseHandler_1.ResponseHandler.internalError("Failed to delete HashMap");
            reply.status(response.statusCode).send(response);
        }
    }
    catch (error) {
        const response = responseHandler_1.ErrorHandler.handleError(error, 'deleteHashMap');
        reply.status(response.statusCode).send(response);
    }
});
// Renommer une HashMap
server.patch("/hashMap/:name/rename", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    try {
        const { name } = request.params;
        const { newName } = request.body;
        const nameValidation = validation_1.Validator.validateHashMapName(name);
        const newNameValidation = validation_1.Validator.validateHashMapName(newName);
        if (!nameValidation.isValid || !newNameValidation.isValid) {
            const errors = [...nameValidation.errors, ...newNameValidation.errors];
            const response = responseHandler_1.ResponseHandler.validationError(errors);
            return reply.status(response.statusCode).send(response);
        }
        const success = collection.renameHashMap(name, newName);
        if (success) {
            const response = responseHandler_1.ResponseHandler.success({ oldName: name, newName }, `HashMap renamed from '${name}' to '${newName}' successfully`);
            reply.status(response.statusCode).send(response);
        }
        else {
            const response = responseHandler_1.ResponseHandler.error("Failed to rename HashMap (source not found or target already exists)", 400);
            reply.status(response.statusCode).send(response);
        }
    }
    catch (error) {
        const response = responseHandler_1.ErrorHandler.handleError(error, 'renameHashMap');
        reply.status(response.statusCode).send(response);
    }
});
// ==== KEY-VALUE OPERATIONS ====
// Ajouter des clés à une HashMap
server.post("/hashMap/:name/keys", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    try {
        const { name } = request.params;
        const nameValidation = validation_1.Validator.validateHashMapName(name);
        if (!nameValidation.isValid) {
            const response = responseHandler_1.ResponseHandler.validationError(nameValidation.errors);
            return reply.status(response.statusCode).send(response);
        }
        if (!collection.hasHashMap(name)) {
            const response = responseHandler_1.ResponseHandler.notFound(`HashMap '${name}'`);
            return reply.status(response.statusCode).send(response);
        }
        const dataValidation = validation_1.Validator.validateHashMapData(request.body);
        if (!dataValidation.keys.isValid || !dataValidation.values.isValid) {
            const errors = [...dataValidation.keys.errors, ...dataValidation.values.errors];
            const response = responseHandler_1.ResponseHandler.validationError(errors);
            return reply.status(response.statusCode).send(response);
        }
        let addedCount = 0;
        for (const [key, value] of Object.entries(request.body)) {
            const success = collection.addToCollection(name, key, value);
            if (success)
                addedCount++;
        }
        const metadata = collection.getHashMapMetadata(name);
        const response = responseHandler_1.ResponseHandler.success({ addedCount, totalKeys: metadata?.elementCount }, `${addedCount} keys added successfully to '${name}'`);
        reply.status(response.statusCode).send(response);
    }
    catch (error) {
        const response = responseHandler_1.ErrorHandler.handleError(error, 'addKeys');
        reply.status(response.statusCode).send(response);
    }
});
// Récupérer une clé spécifique
server.get("/hashMap/:name/keys/:key", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    try {
        const { name, key } = request.params;
        const nameValidation = validation_1.Validator.validateHashMapName(name);
        const keyValidation = validation_1.Validator.validateKey(key);
        if (!nameValidation.isValid || !keyValidation.isValid) {
            const errors = [...nameValidation.errors, ...keyValidation.errors];
            const response = responseHandler_1.ResponseHandler.validationError(errors);
            return reply.status(response.statusCode).send(response);
        }
        if (!collection.hasHashMap(name)) {
            const response = responseHandler_1.ResponseHandler.notFound(`HashMap '${name}'`);
            return reply.status(response.statusCode).send(response);
        }
        const value = collection.getFromCollection(name, key);
        if (value === undefined) {
            const response = responseHandler_1.ResponseHandler.notFound(`Key '${key}' in HashMap '${name}'`);
            return reply.status(response.statusCode).send(response);
        }
        const response = responseHandler_1.ResponseHandler.success({ key, value }, `Key '${key}' retrieved successfully`);
        reply.status(response.statusCode).send(response);
    }
    catch (error) {
        const response = responseHandler_1.ErrorHandler.handleError(error, 'getKey');
        reply.status(response.statusCode).send(response);
    }
});
// Mettre à jour une clé
server.put("/hashMap/:name/keys/:key", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    try {
        const { name, key } = request.params;
        const { value } = request.body;
        const nameValidation = validation_1.Validator.validateHashMapName(name);
        const keyValidation = validation_1.Validator.validateKey(key);
        const valueValidation = validation_1.Validator.validateValue(value);
        if (!nameValidation.isValid || !keyValidation.isValid || !valueValidation.isValid) {
            const errors = [...nameValidation.errors, ...keyValidation.errors, ...valueValidation.errors];
            const response = responseHandler_1.ResponseHandler.validationError(errors);
            return reply.status(response.statusCode).send(response);
        }
        if (!collection.hasHashMap(name)) {
            const response = responseHandler_1.ResponseHandler.notFound(`HashMap '${name}'`);
            return reply.status(response.statusCode).send(response);
        }
        const success = collection.addToCollection(name, key, value);
        if (success) {
            const response = responseHandler_1.ResponseHandler.success({ key, value }, `Key '${key}' updated successfully`);
            reply.status(response.statusCode).send(response);
        }
        else {
            const response = responseHandler_1.ResponseHandler.internalError("Failed to update key");
            reply.status(response.statusCode).send(response);
        }
    }
    catch (error) {
        const response = responseHandler_1.ErrorHandler.handleError(error, 'updateKey');
        reply.status(response.statusCode).send(response);
    }
});
// Supprimer une clé
server.delete("/hashMap/:name/keys/:key", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    try {
        const { name, key } = request.params;
        const nameValidation = validation_1.Validator.validateHashMapName(name);
        const keyValidation = validation_1.Validator.validateKey(key);
        if (!nameValidation.isValid || !keyValidation.isValid) {
            const errors = [...nameValidation.errors, ...keyValidation.errors];
            const response = responseHandler_1.ResponseHandler.validationError(errors);
            return reply.status(response.statusCode).send(response);
        }
        if (!collection.hasHashMap(name)) {
            const response = responseHandler_1.ResponseHandler.notFound(`HashMap '${name}'`);
            return reply.status(response.statusCode).send(response);
        }
        const success = collection.removeFromCollection(name, key);
        if (success) {
            const response = responseHandler_1.ResponseHandler.success({ key }, `Key '${key}' deleted successfully`);
            reply.status(response.statusCode).send(response);
        }
        else {
            const response = responseHandler_1.ResponseHandler.notFound(`Key '${key}' in HashMap '${name}'`);
            reply.status(response.statusCode).send(response);
        }
    }
    catch (error) {
        const response = responseHandler_1.ErrorHandler.handleError(error, 'deleteKey');
        reply.status(response.statusCode).send(response);
    }
});
// ==== PERSISTENCE OPERATIONS ====
// Sauvegarder une HashMap spécifique
server.post("/hashMap/:name/save", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    try {
        const { name } = request.params;
        const nameValidation = validation_1.Validator.validateHashMapName(name);
        if (!nameValidation.isValid) {
            const response = responseHandler_1.ResponseHandler.validationError(nameValidation.errors);
            return reply.status(response.statusCode).send(response);
        }
        if (!collection.hasHashMap(name)) {
            const response = responseHandler_1.ResponseHandler.notFound(`HashMap '${name}'`);
            return reply.status(response.statusCode).send(response);
        }
        const success = await database.saveHashMap(name);
        if (success) {
            const response = responseHandler_1.ResponseHandler.success({ hashMapName: name }, `HashMap '${name}' saved successfully`);
            reply.status(response.statusCode).send(response);
        }
        else {
            const response = responseHandler_1.ResponseHandler.internalError("Failed to save HashMap");
            reply.status(response.statusCode).send(response);
        }
    }
    catch (error) {
        const response = responseHandler_1.ErrorHandler.handleError(error, 'saveHashMap');
        reply.status(response.statusCode).send(response);
    }
});
// Charger une HashMap depuis un fichier
server.post("/hashMap/load", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    try {
        const { name, filename } = request.body;
        const validation = validation_1.Validator.validateRequest(request.body, ['name']);
        if (!validation.isValid) {
            const response = responseHandler_1.ResponseHandler.validationError(validation.errors);
            return reply.status(response.statusCode).send(response);
        }
        const nameValidation = validation_1.Validator.validateHashMapName(name);
        if (!nameValidation.isValid) {
            const response = responseHandler_1.ResponseHandler.validationError(nameValidation.errors);
            return reply.status(response.statusCode).send(response);
        }
        const success = await database.loadHashMap(name, filename);
        if (success) {
            const metadata = collection.getHashMapMetadata(name);
            const response = responseHandler_1.ResponseHandler.success({ hashMapName: name, metadata }, `HashMap '${name}' loaded successfully`);
            reply.status(response.statusCode).send(response);
        }
        else {
            const response = responseHandler_1.ResponseHandler.internalError("Failed to load HashMap");
            reply.status(response.statusCode).send(response);
        }
    }
    catch (error) {
        const response = responseHandler_1.ErrorHandler.handleError(error, 'loadHashMap');
        reply.status(response.statusCode).send(response);
    }
});
// Sauvegarder toute la collection
server.post("/collection/save", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    try {
        const { filename } = request.body || {};
        const success = await database.saveCollection(filename);
        if (success) {
            const response = responseHandler_1.ResponseHandler.success({ filename: filename || 'collection.json' }, "Collection saved successfully");
            reply.status(response.statusCode).send(response);
        }
        else {
            const response = responseHandler_1.ResponseHandler.internalError("Failed to save collection");
            reply.status(response.statusCode).send(response);
        }
    }
    catch (error) {
        const response = responseHandler_1.ErrorHandler.handleError(error, 'saveCollection');
        reply.status(response.statusCode).send(response);
    }
});
// Charger toute la collection
server.post("/collection/load", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    try {
        const { filename } = request.body || {};
        const success = await database.loadCollection(filename);
        if (success) {
            const data = collection.getAll();
            const response = responseHandler_1.ResponseHandler.success({ filename: filename || 'collection.json', collection: data }, "Collection loaded successfully");
            reply.status(response.statusCode).send(response);
        }
        else {
            const response = responseHandler_1.ResponseHandler.internalError("Failed to load collection");
            reply.status(response.statusCode).send(response);
        }
    }
    catch (error) {
        const response = responseHandler_1.ErrorHandler.handleError(error, 'loadCollection');
        reply.status(response.statusCode).send(response);
    }
});
// Lister les fichiers de sauvegarde
server.get("/saves", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    try {
        const files = await database.listSaveFiles();
        const response = responseHandler_1.ResponseHandler.success({ files }, "Save files retrieved successfully");
        reply.status(response.statusCode).send(response);
    }
    catch (error) {
        const response = responseHandler_1.ErrorHandler.handleError(error, 'listSaveFiles');
        reply.status(response.statusCode).send(response);
    }
});
// ==== STATISTICS & MANAGEMENT ====
// Obtenir les statistiques globales
server.get("/stats", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    try {
        const collectionStats = collection.getStats();
        const databaseStats = await database.getDatabaseStats();
        const response = responseHandler_1.ResponseHandler.success({ collection: collectionStats, database: databaseStats }, "Statistics retrieved successfully");
        reply.status(response.statusCode).send(response);
    }
    catch (error) {
        const response = responseHandler_1.ErrorHandler.handleError(error, 'getStats');
        reply.status(response.statusCode).send(response);
    }
});
// Exporter une HashMap en CSV
server.post("/hashMap/:name/export/csv", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    try {
        const { name } = request.params;
        const { filename } = request.body || {};
        const nameValidation = validation_1.Validator.validateHashMapName(name);
        if (!nameValidation.isValid) {
            const response = responseHandler_1.ResponseHandler.validationError(nameValidation.errors);
            return reply.status(response.statusCode).send(response);
        }
        if (!collection.hasHashMap(name)) {
            const response = responseHandler_1.ResponseHandler.notFound(`HashMap '${name}'`);
            return reply.status(response.statusCode).send(response);
        }
        const success = await database.exportToCSV(name, filename);
        if (success) {
            const response = responseHandler_1.ResponseHandler.success({ hashMapName: name, filename: filename || `${name}.csv` }, `HashMap '${name}' exported to CSV successfully`);
            reply.status(response.statusCode).send(response);
        }
        else {
            const response = responseHandler_1.ResponseHandler.internalError("Failed to export HashMap to CSV");
            reply.status(response.statusCode).send(response);
        }
    }
    catch (error) {
        const response = responseHandler_1.ErrorHandler.handleError(error, 'exportToCSV');
        reply.status(response.statusCode).send(response);
    }
});
// Configuration de persistence
server.put("/config/persistence", { preHandler: authGuard_1.authGuard }, async (request, reply) => {
    try {
        const config = request.body;
        database.updateConfig(config);
        const response = responseHandler_1.ResponseHandler.success({ config }, "Persistence configuration updated successfully");
        reply.status(response.statusCode).send(response);
    }
    catch (error) {
        const response = responseHandler_1.ErrorHandler.handleError(error, 'updatePersistenceConfig');
        reply.status(response.statusCode).send(response);
    }
});
// Health check
server.get("/health", async (request, reply) => {
    const response = responseHandler_1.ResponseHandler.success({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        collection: collection.getStats()
    }, "Service is healthy");
    reply.status(response.statusCode).send(response);
});
// Gestion propre de l'arrêt
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, saving data before shutdown...');
    await database.saveCollection('collection_shutdown.json');
    database.stopAutoSave();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('Received SIGINT, saving data before shutdown...');
    await database.saveCollection('collection_shutdown.json');
    database.stopAutoSave();
    process.exit(0);
});
server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`✅ Server listening at ${address}`);
    console.log(`✅ Auto-save enabled, saving every 5 minutes`);
    console.log(`✅ Data directory: ./data`);
});
//# sourceMappingURL=main.js.map