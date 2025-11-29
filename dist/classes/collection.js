"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
const bucketManager_1 = require("./bucketManager");
const hasher_1 = require("./hasher");
const hashmap_1 = __importDefault(require("./hashmap"));
const indexCalculator_1 = require("./indexCalculator");
const resizeManager_1 = require("./resizeManager");
const skipList_1 = require("./skipList");
class Collection {
    hashMaps;
    nextIndex;
    hasher;
    indexCalculator;
    constructor() {
        this.hashMaps = new Map();
        this.nextIndex = 0;
        this.hasher = new hasher_1.Hasher();
        this.indexCalculator = new indexCalculator_1.IndexCalculator(this.hasher);
    }
    // Créer une nouvelle HashMap dans la collection
    createHashMap(name, initialData) {
        if (this.hashMaps.has(name)) {
            throw new Error(`HashMap with name '${name}' already exists`);
        }
        const bucketManager = new bucketManager_1.BucketManager();
        const resizeManager = new resizeManager_1.ResizeManager();
        const skipList = new skipList_1.SkipList();
        const now = new Date().toISOString();
        const newHashMap = new hashmap_1.default(this.indexCalculator, // Singleton partagé
        bucketManager, // Instance dédiée
        resizeManager, // Instance dédiée
        skipList);
        // Ajouter les données initiales si fournies
        if (initialData) {
            for (const [key, value] of Object.entries(initialData)) {
                newHashMap.addToHashMap(key, value);
            }
        }
        this.nextIndex++;
        this.hashMaps.set(name, {
            id: this.nextIndex,
            hashMap: newHashMap,
            createdAt: now,
            updatedAt: now,
            lastAccessed: now
        });
        return newHashMap;
    }
    // Récupérer une HashMap de la collection
    getHashMap(name) {
        const hashMapData = this.hashMaps.get(name);
        if (hashMapData) {
            // Mettre à jour le lastAccessed
            hashMapData.lastAccessed = new Date().toISOString();
            return hashMapData.hashMap;
        }
        return undefined;
    }
    // Récupérer les métadonnées d'une HashMap
    getHashMapMetadata(name) {
        const hashMapData = this.hashMaps.get(name);
        if (hashMapData) {
            return {
                id: hashMapData.id,
                name,
                createdAt: hashMapData.createdAt,
                updatedAt: hashMapData.updatedAt,
                lastAccessed: hashMapData.lastAccessed,
                elementCount: hashMapData.hashMap.getCountElment(),
                bucketCount: hashMapData.hashMap.gethashMapLenght()
            };
        }
        return undefined;
    }
    // Récupérer toutes les HashMaps avec leurs métadonnées
    getAll() {
        const hashMaps = [];
        let totalElements = 0;
        for (const [name, value] of this.hashMaps) {
            const elementCount = value.hashMap.getCountElment();
            totalElements += elementCount;
            hashMaps.push({
                id: value.id,
                name,
                createdAt: value.createdAt,
                updatedAt: value.updatedAt,
                lastAccessed: value.lastAccessed,
                elementCount,
                bucketCount: value.hashMap.gethashMapLenght()
            });
        }
        return {
            hashMaps,
            totalHashMaps: this.hashMaps.size,
            totalElements
        };
    }
    // Méthodes proxy pour respecter le SRP
    addToCollection(name, key, value) {
        const hashMapData = this.hashMaps.get(name);
        if (hashMapData) {
            hashMapData.hashMap.addToHashMap(key, value);
            hashMapData.updatedAt = new Date().toISOString();
            hashMapData.lastAccessed = new Date().toISOString();
            return true;
        }
        return false;
    }
    removeFromCollection(name, key) {
        const hashMapData = this.hashMaps.get(name);
        if (hashMapData) {
            const result = hashMapData.hashMap.removeToHashMap(key);
            if (result) {
                hashMapData.updatedAt = new Date().toISOString();
                hashMapData.lastAccessed = new Date().toISOString();
            }
            return result;
        }
        return false;
    }
    getFromCollection(name, key) {
        const hashMapData = this.hashMaps.get(name);
        if (hashMapData) {
            hashMapData.lastAccessed = new Date().toISOString();
            return hashMapData.hashMap.getKey(key);
        }
        return undefined;
    }
    getAllDataFromHashMap(name) {
        const hashMapData = this.hashMaps.get(name);
        if (hashMapData) {
            hashMapData.lastAccessed = new Date().toISOString();
            return hashMapData.hashMap.getAllData();
        }
        return undefined;
    }
    setNextIndex(nextIndex) {
        this.nextIndex = nextIndex;
    }
    getNextIndex() {
        return this.nextIndex;
    }
    calculateIndex() {
        this.nextIndex = this.nextIndex + 1;
    }
    removeHashMap(name) {
        return this.hashMaps.delete(name);
    }
    // Vérifier si une HashMap existe
    hasHashMap(name) {
        return this.hashMaps.has(name);
    }
    // Renommer une HashMap
    renameHashMap(oldName, newName) {
        if (!this.hashMaps.has(oldName) || this.hashMaps.has(newName)) {
            return false;
        }
        const hashMapData = this.hashMaps.get(oldName);
        hashMapData.updatedAt = new Date().toISOString();
        this.hashMaps.set(newName, hashMapData);
        this.hashMaps.delete(oldName);
        return true;
    }
    // Obtenir les statistiques globales
    getStats() {
        let totalElements = 0;
        let totalBuckets = 0;
        for (const [, value] of this.hashMaps) {
            totalElements += value.hashMap.getCountElment();
            totalBuckets += value.hashMap.gethashMapLenght();
        }
        return {
            totalHashMaps: this.hashMaps.size,
            totalElements,
            totalBuckets,
            averageElementsPerHashMap: this.hashMaps.size > 0 ? totalElements / this.hashMaps.size : 0
        };
    }
    // Serialiser toute la collection pour la sauvegarde
    serialize() {
        const data = {
            metadata: {
                version: '1.0.0',
                createdAt: new Date().toISOString(),
                totalHashMaps: this.hashMaps.size,
                nextIndex: this.nextIndex
            },
            hashMaps: {}
        };
        for (const [name, hashMapData] of this.hashMaps) {
            data.hashMaps[name] = {
                id: hashMapData.id,
                createdAt: hashMapData.createdAt,
                updatedAt: hashMapData.updatedAt,
                lastAccessed: hashMapData.lastAccessed,
                data: hashMapData.hashMap.getAllData()
            };
        }
        return data;
    }
    // Charger une collection depuis des données sérialisées
    deserialize(data) {
        try {
            if (!data.metadata || !data.hashMaps) {
                return false;
            }
            // Nettoyer la collection actuelle
            this.hashMaps.clear();
            this.nextIndex = data.metadata.nextIndex || 0;
            // Restaurer chaque HashMap
            for (const [name, hashMapDataRaw] of Object.entries(data.hashMaps)) {
                const bucketManager = new bucketManager_1.BucketManager();
                const resizeManager = new resizeManager_1.ResizeManager();
                const skipList = new skipList_1.SkipList();
                const newHashMap = new hashmap_1.default(this.indexCalculator, bucketManager, resizeManager, skipList);
                // Restaurer les données
                if (hashMapDataRaw.data && Array.isArray(hashMapDataRaw.data)) {
                    for (const item of hashMapDataRaw.data) {
                        if (item.key !== undefined && item.value !== undefined) {
                            newHashMap.addToHashMap(item.key, item.value);
                        }
                    }
                }
                this.hashMaps.set(name, {
                    id: hashMapDataRaw.id,
                    hashMap: newHashMap,
                    createdAt: hashMapDataRaw.createdAt,
                    updatedAt: hashMapDataRaw.updatedAt,
                    lastAccessed: hashMapDataRaw.lastAccessed
                });
            }
            return true;
        }
        catch (error) {
            console.error('Error deserializing collection:', error);
            return false;
        }
    }
    findRange(name, key, min, max) {
        // TODO: Implémenter la recherche par range avec SkipList
    }
}
exports.Collection = Collection;
//# sourceMappingURL=collection.js.map