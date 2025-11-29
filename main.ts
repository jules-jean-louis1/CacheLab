import fastify from "fastify";
import { getJWT } from "./utils/utils";
import { authGuard } from "./guard/authGuard";
import { initialData } from "./scripts/seedData";
import { Collection } from "./classes/collection";
import { Database } from "./classes/database";
import { Validator } from "./utils/validation";
import { ResponseHandler, ErrorHandler } from "./utils/responseHandler";
import { 
  CreateHashMapRequest, 
  AddKeysRequest, 
  UpdateKeyRequest, 
  ApiResponse, 
  ErrorResponse 
} from "./types/types";

const server = fastify({ logger: true });

// Initialisation
const collection = new Collection();
const database = new Database(collection, {
  autoSave: true,
  saveInterval: 300000, // 5 minutes
  backupCount: 5,
  compression: false
});

// Charger les données initiales
try {
  const initHashMap = collection.createHashMap("cart_user", 
    Object.fromEntries(initialData.map(entry => [entry.key, entry.value]))
  );
  console.log("Initial data loaded successfully");
} catch (error) {
  console.error("Error loading initial data:", error);
}

// Middleware de gestion des erreurs globales
server.setErrorHandler((error, request, reply) => {
  const errorResponse = ErrorHandler.handleError(error);
  reply.status(errorResponse.statusCode).send(errorResponse);
});

// ==== AUTHENTICATION ====
server.post("/auth/login", async (request, reply) => {
  const token = getJWT();
  const response = token.length
    ? ResponseHandler.success({ token }, "Login successful")
    : ResponseHandler.error("Failed to generate token", 500);
  
  reply.status(response.statusCode).send(response);
});

// ==== COLLECTION MANAGEMENT ====

// Créer une nouvelle HashMap
server.post<{
  Body: CreateHashMapRequest;
}>("/hashMap", { preHandler: authGuard }, async (request, reply) => {
  try {
    const validation = Validator.validateRequest(request.body, ['name']);
    if (!validation.isValid) {
      const response = ResponseHandler.validationError(validation.errors);
      return reply.status(response.statusCode).send(response);
    }

    const { name, initialData } = request.body;
    const nameValidation = Validator.validateHashMapName(name);
    if (!nameValidation.isValid) {
      const response = ResponseHandler.validationError(nameValidation.errors);
      return reply.status(response.statusCode).send(response);
    }

    // Valider les données initiales si fournies
    if (initialData) {
      const dataValidation = Validator.validateHashMapData(initialData);
      if (!dataValidation.keys.isValid || !dataValidation.values.isValid) {
        const errors = [...dataValidation.keys.errors, ...dataValidation.values.errors];
        const response = ResponseHandler.validationError(errors);
        return reply.status(response.statusCode).send(response);
      }
    }

    const newHashMap = collection.createHashMap(name, initialData);
    const metadata = collection.getHashMapMetadata(name);
    const response = ResponseHandler.success(
      { hashMap: metadata }, 
      `HashMap '${name}' created successfully`, 
      201
    );
    
    reply.status(response.statusCode).send(response);
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      const response = ResponseHandler.conflict(`HashMap '${request.body.name}'`);
      return reply.status(response.statusCode).send(response);
    }
    
    const response = ErrorHandler.handleError(error as Error, 'createHashMap');
    reply.status(response.statusCode).send(response);
  }
});

// Lister toutes les HashMaps
server.get("/hashMaps", { preHandler: authGuard }, async (request, reply) => {
  try {
    const data = collection.getAll();
    const response = ResponseHandler.success(data, "HashMaps retrieved successfully");
    reply.status(response.statusCode).send(response);
  } catch (error) {
    const response = ErrorHandler.handleError(error as Error, 'listHashMaps');
    reply.status(response.statusCode).send(response);
  }
});

// Obtenir une HashMap spécifique
server.get<{ 
  Params: { name: string };
}>("/hashMap/:name", { preHandler: authGuard }, async (request, reply) => {
  try {
    const { name } = request.params;
    const nameValidation = Validator.validateHashMapName(name);
    if (!nameValidation.isValid) {
      const response = ResponseHandler.validationError(nameValidation.errors);
      return reply.status(response.statusCode).send(response);
    }

    const metadata = collection.getHashMapMetadata(name);
    if (!metadata) {
      const response = ResponseHandler.notFound(`HashMap '${name}'`);
      return reply.status(response.statusCode).send(response);
    }

    const data = collection.getAllDataFromHashMap(name);
    const response = ResponseHandler.success(
      { metadata, data },
      `HashMap '${name}' retrieved successfully`
    );
    
    reply.status(response.statusCode).send(response);
  } catch (error) {
    const response = ErrorHandler.handleError(error as Error, 'getHashMap');
    reply.status(response.statusCode).send(response);
  }
});

// Supprimer une HashMap
server.delete<{ 
  Params: { name: string };
}>("/hashMap/:name", { preHandler: authGuard }, async (request, reply) => {
  try {
    const { name } = request.params;
    const nameValidation = Validator.validateHashMapName(name);
    if (!nameValidation.isValid) {
      const response = ResponseHandler.validationError(nameValidation.errors);
      return reply.status(response.statusCode).send(response);
    }

    if (!collection.hasHashMap(name)) {
      const response = ResponseHandler.notFound(`HashMap '${name}'`);
      return reply.status(response.statusCode).send(response);
    }

    const success = collection.removeHashMap(name);
    if (success) {
      const response = ResponseHandler.success(
        null, 
        `HashMap '${name}' deleted successfully`
      );
      reply.status(response.statusCode).send(response);
    } else {
      const response = ResponseHandler.internalError("Failed to delete HashMap");
      reply.status(response.statusCode).send(response);
    }
  } catch (error) {
    const response = ErrorHandler.handleError(error as Error, 'deleteHashMap');
    reply.status(response.statusCode).send(response);
  }
});

// Renommer une HashMap
server.patch<{
  Params: { name: string };
  Body: { newName: string };
}>("/hashMap/:name/rename", { preHandler: authGuard }, async (request, reply) => {
  try {
    const { name } = request.params;
    const { newName } = request.body;
    
    const nameValidation = Validator.validateHashMapName(name);
    const newNameValidation = Validator.validateHashMapName(newName);
    
    if (!nameValidation.isValid || !newNameValidation.isValid) {
      const errors = [...nameValidation.errors, ...newNameValidation.errors];
      const response = ResponseHandler.validationError(errors);
      return reply.status(response.statusCode).send(response);
    }

    const success = collection.renameHashMap(name, newName);
    if (success) {
      const response = ResponseHandler.success(
        { oldName: name, newName },
        `HashMap renamed from '${name}' to '${newName}' successfully`
      );
      reply.status(response.statusCode).send(response);
    } else {
      const response = ResponseHandler.error(
        "Failed to rename HashMap (source not found or target already exists)",
        400
      );
      reply.status(response.statusCode).send(response);
    }
  } catch (error) {
    const response = ErrorHandler.handleError(error as Error, 'renameHashMap');
    reply.status(response.statusCode).send(response);
  }
});

// ==== KEY-VALUE OPERATIONS ====

// Ajouter des clés à une HashMap
server.post<{
  Params: { name: string };
  Body: AddKeysRequest;
}>("/hashMap/:name/keys", { preHandler: authGuard }, async (request, reply) => {
  try {
    const { name } = request.params;
    const nameValidation = Validator.validateHashMapName(name);
    if (!nameValidation.isValid) {
      const response = ResponseHandler.validationError(nameValidation.errors);
      return reply.status(response.statusCode).send(response);
    }

    if (!collection.hasHashMap(name)) {
      const response = ResponseHandler.notFound(`HashMap '${name}'`);
      return reply.status(response.statusCode).send(response);
    }

    const dataValidation = Validator.validateHashMapData(request.body);
    if (!dataValidation.keys.isValid || !dataValidation.values.isValid) {
      const errors = [...dataValidation.keys.errors, ...dataValidation.values.errors];
      const response = ResponseHandler.validationError(errors);
      return reply.status(response.statusCode).send(response);
    }

    let addedCount = 0;
    for (const [key, value] of Object.entries(request.body)) {
      const success = collection.addToCollection(name, key, value);
      if (success) addedCount++;
    }

    const metadata = collection.getHashMapMetadata(name);
    const response = ResponseHandler.success(
      { addedCount, totalKeys: metadata?.elementCount },
      `${addedCount} keys added successfully to '${name}'`
    );
    
    reply.status(response.statusCode).send(response);
  } catch (error) {
    const response = ErrorHandler.handleError(error as Error, 'addKeys');
    reply.status(response.statusCode).send(response);
  }
});

// Récupérer une clé spécifique
server.get<{
  Params: { name: string; key: string };
}>("/hashMap/:name/keys/:key", { preHandler: authGuard }, async (request, reply) => {
  try {
    const { name, key } = request.params;
    
    const nameValidation = Validator.validateHashMapName(name);
    const keyValidation = Validator.validateKey(key);
    
    if (!nameValidation.isValid || !keyValidation.isValid) {
      const errors = [...nameValidation.errors, ...keyValidation.errors];
      const response = ResponseHandler.validationError(errors);
      return reply.status(response.statusCode).send(response);
    }

    if (!collection.hasHashMap(name)) {
      const response = ResponseHandler.notFound(`HashMap '${name}'`);
      return reply.status(response.statusCode).send(response);
    }

    const value = collection.getFromCollection(name, key);
    if (value === undefined) {
      const response = ResponseHandler.notFound(`Key '${key}' in HashMap '${name}'`);
      return reply.status(response.statusCode).send(response);
    }

    const response = ResponseHandler.success(
      { key, value },
      `Key '${key}' retrieved successfully`
    );
    
    reply.status(response.statusCode).send(response);
  } catch (error) {
    const response = ErrorHandler.handleError(error as Error, 'getKey');
    reply.status(response.statusCode).send(response);
  }
});

// Mettre à jour une clé
server.put<{
  Params: { name: string; key: string };
  Body: UpdateKeyRequest;
}>("/hashMap/:name/keys/:key", { preHandler: authGuard }, async (request, reply) => {
  try {
    const { name, key } = request.params;
    const { value } = request.body;
    
    const nameValidation = Validator.validateHashMapName(name);
    const keyValidation = Validator.validateKey(key);
    const valueValidation = Validator.validateValue(value);
    
    if (!nameValidation.isValid || !keyValidation.isValid || !valueValidation.isValid) {
      const errors = [...nameValidation.errors, ...keyValidation.errors, ...valueValidation.errors];
      const response = ResponseHandler.validationError(errors);
      return reply.status(response.statusCode).send(response);
    }

    if (!collection.hasHashMap(name)) {
      const response = ResponseHandler.notFound(`HashMap '${name}'`);
      return reply.status(response.statusCode).send(response);
    }

    const success = collection.addToCollection(name, key, value);
    if (success) {
      const response = ResponseHandler.success(
        { key, value },
        `Key '${key}' updated successfully`
      );
      reply.status(response.statusCode).send(response);
    } else {
      const response = ResponseHandler.internalError("Failed to update key");
      reply.status(response.statusCode).send(response);
    }
  } catch (error) {
    const response = ErrorHandler.handleError(error as Error, 'updateKey');
    reply.status(response.statusCode).send(response);
  }
});

// Supprimer une clé
server.delete<{
  Params: { name: string; key: string };
}>("/hashMap/:name/keys/:key", { preHandler: authGuard }, async (request, reply) => {
  try {
    const { name, key } = request.params;
    
    const nameValidation = Validator.validateHashMapName(name);
    const keyValidation = Validator.validateKey(key);
    
    if (!nameValidation.isValid || !keyValidation.isValid) {
      const errors = [...nameValidation.errors, ...keyValidation.errors];
      const response = ResponseHandler.validationError(errors);
      return reply.status(response.statusCode).send(response);
    }

    if (!collection.hasHashMap(name)) {
      const response = ResponseHandler.notFound(`HashMap '${name}'`);
      return reply.status(response.statusCode).send(response);
    }

    const success = collection.removeFromCollection(name, key);
    if (success) {
      const response = ResponseHandler.success(
        { key },
        `Key '${key}' deleted successfully`
      );
      reply.status(response.statusCode).send(response);
    } else {
      const response = ResponseHandler.notFound(`Key '${key}' in HashMap '${name}'`);
      reply.status(response.statusCode).send(response);
    }
  } catch (error) {
    const response = ErrorHandler.handleError(error as Error, 'deleteKey');
    reply.status(response.statusCode).send(response);
  }
});

// ==== PERSISTENCE OPERATIONS ====

// Sauvegarder une HashMap spécifique
server.post<{ 
  Params: { name: string };
}>("/hashMap/:name/save", { preHandler: authGuard }, async (request, reply) => {
  try {
    const { name } = request.params;
    
    const nameValidation = Validator.validateHashMapName(name);
    if (!nameValidation.isValid) {
      const response = ResponseHandler.validationError(nameValidation.errors);
      return reply.status(response.statusCode).send(response);
    }

    if (!collection.hasHashMap(name)) {
      const response = ResponseHandler.notFound(`HashMap '${name}'`);
      return reply.status(response.statusCode).send(response);
    }

    const success = await database.saveHashMap(name);
    if (success) {
      const response = ResponseHandler.success(
        { hashMapName: name },
        `HashMap '${name}' saved successfully`
      );
      reply.status(response.statusCode).send(response);
    } else {
      const response = ResponseHandler.internalError("Failed to save HashMap");
      reply.status(response.statusCode).send(response);
    }
  } catch (error) {
    const response = ErrorHandler.handleError(error as Error, 'saveHashMap');
    reply.status(response.statusCode).send(response);
  }
});

// Charger une HashMap depuis un fichier
server.post<{
  Body: { name: string; filename?: string };
}>("/hashMap/load", { preHandler: authGuard }, async (request, reply) => {
  try {
    const { name, filename } = request.body;
    
    const validation = Validator.validateRequest(request.body, ['name']);
    if (!validation.isValid) {
      const response = ResponseHandler.validationError(validation.errors);
      return reply.status(response.statusCode).send(response);
    }

    const nameValidation = Validator.validateHashMapName(name);
    if (!nameValidation.isValid) {
      const response = ResponseHandler.validationError(nameValidation.errors);
      return reply.status(response.statusCode).send(response);
    }

    const success = await database.loadHashMap(name, filename);
    if (success) {
      const metadata = collection.getHashMapMetadata(name);
      const response = ResponseHandler.success(
        { hashMapName: name, metadata },
        `HashMap '${name}' loaded successfully`
      );
      reply.status(response.statusCode).send(response);
    } else {
      const response = ResponseHandler.internalError("Failed to load HashMap");
      reply.status(response.statusCode).send(response);
    }
  } catch (error) {
    const response = ErrorHandler.handleError(error as Error, 'loadHashMap');
    reply.status(response.statusCode).send(response);
  }
});

// Sauvegarder toute la collection
server.post<{
  Body: { filename?: string };
}>("/collection/save", { preHandler: authGuard }, async (request, reply) => {
  try {
    const { filename } = request.body || {};
    
    const success = await database.saveCollection(filename);
    if (success) {
      const response = ResponseHandler.success(
        { filename: filename || 'collection.json' },
        "Collection saved successfully"
      );
      reply.status(response.statusCode).send(response);
    } else {
      const response = ResponseHandler.internalError("Failed to save collection");
      reply.status(response.statusCode).send(response);
    }
  } catch (error) {
    const response = ErrorHandler.handleError(error as Error, 'saveCollection');
    reply.status(response.statusCode).send(response);
  }
});

// Charger toute la collection
server.post<{
  Body: { filename?: string };
}>("/collection/load", { preHandler: authGuard }, async (request, reply) => {
  try {
    const { filename } = request.body || {};
    
    const success = await database.loadCollection(filename);
    if (success) {
      const data = collection.getAll();
      const response = ResponseHandler.success(
        { filename: filename || 'collection.json', collection: data },
        "Collection loaded successfully"
      );
      reply.status(response.statusCode).send(response);
    } else {
      const response = ResponseHandler.internalError("Failed to load collection");
      reply.status(response.statusCode).send(response);
    }
  } catch (error) {
    const response = ErrorHandler.handleError(error as Error, 'loadCollection');
    reply.status(response.statusCode).send(response);
  }
});

// Lister les fichiers de sauvegarde
server.get("/saves", { preHandler: authGuard }, async (request, reply) => {
  try {
    const files = await database.listSaveFiles();
    const response = ResponseHandler.success(
      { files },
      "Save files retrieved successfully"
    );
    reply.status(response.statusCode).send(response);
  } catch (error) {
    const response = ErrorHandler.handleError(error as Error, 'listSaveFiles');
    reply.status(response.statusCode).send(response);
  }
});

// ==== STATISTICS & MANAGEMENT ====

// Obtenir les statistiques globales
server.get("/stats", { preHandler: authGuard }, async (request, reply) => {
  try {
    const collectionStats = collection.getStats();
    const databaseStats = await database.getDatabaseStats();
    
    const response = ResponseHandler.success(
      { collection: collectionStats, database: databaseStats },
      "Statistics retrieved successfully"
    );
    reply.status(response.statusCode).send(response);
  } catch (error) {
    const response = ErrorHandler.handleError(error as Error, 'getStats');
    reply.status(response.statusCode).send(response);
  }
});

// Exporter une HashMap en CSV
server.post<{
  Params: { name: string };
  Body: { filename?: string };
}>("/hashMap/:name/export/csv", { preHandler: authGuard }, async (request, reply) => {
  try {
    const { name } = request.params;
    const { filename } = request.body || {};
    
    const nameValidation = Validator.validateHashMapName(name);
    if (!nameValidation.isValid) {
      const response = ResponseHandler.validationError(nameValidation.errors);
      return reply.status(response.statusCode).send(response);
    }

    if (!collection.hasHashMap(name)) {
      const response = ResponseHandler.notFound(`HashMap '${name}'`);
      return reply.status(response.statusCode).send(response);
    }

    const success = await database.exportToCSV(name, filename);
    if (success) {
      const response = ResponseHandler.success(
        { hashMapName: name, filename: filename || `${name}.csv` },
        `HashMap '${name}' exported to CSV successfully`
      );
      reply.status(response.statusCode).send(response);
    } else {
      const response = ResponseHandler.internalError("Failed to export HashMap to CSV");
      reply.status(response.statusCode).send(response);
    }
  } catch (error) {
    const response = ErrorHandler.handleError(error as Error, 'exportToCSV');
    reply.status(response.statusCode).send(response);
  }
});

// Configuration de persistence
server.put<{
  Body: { autoSave?: boolean; saveInterval?: number; backupCount?: number; compression?: boolean };
}>("/config/persistence", { preHandler: authGuard }, async (request, reply) => {
  try {
    const config = request.body;
    database.updateConfig(config);
    
    const response = ResponseHandler.success(
      { config },
      "Persistence configuration updated successfully"
    );
    reply.status(response.statusCode).send(response);
  } catch (error) {
    const response = ErrorHandler.handleError(error as Error, 'updatePersistenceConfig');
    reply.status(response.statusCode).send(response);
  }
});

// Health check
server.get("/health", async (request, reply) => {
  const response = ResponseHandler.success(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      collection: collection.getStats()
    },
    "Service is healthy"
  );
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