import { BucketManager } from "./bucketManager";
import { Hasher } from "./hasher";
import HashMap from "./hashmap";
import { IndexCalculator } from "./indexCalculator";
import { ResizeManager } from "./resizeManager";
import { SkipList } from "./skipList";
import { HashMapMetadata, CollectionData } from "../types/types";

export type CollectionType = {
  hashMaps: Map<string, { hashMap: HashMap; createdAt: string; updatedAt: string; id: number; lastAccessed: string }>;
  nextIndex: number;
  hasher: Hasher;
  indexCalculator: IndexCalculator;
};

interface HashMapData {
  id: number;
  hashMap: HashMap;
  createdAt: string;
  updatedAt: string;
  lastAccessed: string;
  data?: any[];
}

export class Collection {
  private hashMaps: Map<string, HashMapData>;
  private nextIndex: number;
  private hasher: Hasher;
  private indexCalculator: IndexCalculator;

  constructor() {
    this.hashMaps = new Map();
    this.nextIndex = 0;
    this.hasher = new Hasher();
    this.indexCalculator = new IndexCalculator(this.hasher);
  }

  // Créer une nouvelle HashMap dans la collection
  createHashMap(name: string, initialData?: Record<string, any>): HashMap {
    if (this.hashMaps.has(name)) {
      throw new Error(`HashMap with name '${name}' already exists`);
    }

    const bucketManager = new BucketManager();
    const resizeManager = new ResizeManager();
    const skipList = new SkipList();
    const now = new Date().toISOString();

    const newHashMap = new HashMap(
      this.indexCalculator, // Singleton partagé
      bucketManager, // Instance dédiée
      resizeManager, // Instance dédiée
      skipList,
    );

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
  getHashMap(name: string): HashMap | undefined {
    const hashMapData = this.hashMaps.get(name);
    if (hashMapData) {
      // Mettre à jour le lastAccessed
      hashMapData.lastAccessed = new Date().toISOString();
      return hashMapData.hashMap;
    }
    return undefined;
  }

  // Récupérer les métadonnées d'une HashMap
  getHashMapMetadata(name: string): HashMapMetadata | undefined {
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
  getAll(): CollectionData {
    const hashMaps: HashMapMetadata[] = [];
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
  addToCollection(name: string, key: string, value: any): boolean {
    const hashMapData = this.hashMaps.get(name);
    if (hashMapData) {
      hashMapData.hashMap.addToHashMap(key, value);
      hashMapData.updatedAt = new Date().toISOString();
      hashMapData.lastAccessed = new Date().toISOString();
      return true;
    }
    return false;
  }

  removeFromCollection(name: string, key: string): boolean {
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

  getFromCollection(name: string, key: string): any {
    const hashMapData = this.hashMaps.get(name);
    if (hashMapData) {
      hashMapData.lastAccessed = new Date().toISOString();
      return hashMapData.hashMap.getKey(key);
    }
    return undefined;
  }

  getAllDataFromHashMap(name: string): any[] | undefined {
    const hashMapData = this.hashMaps.get(name);
    if (hashMapData) {
      hashMapData.lastAccessed = new Date().toISOString();
      return hashMapData.hashMap.getAllData();
    }
    return undefined;
  }

  setNextIndex(nextIndex: number) {
    this.nextIndex = nextIndex;
  }

  getNextIndex() {
    return this.nextIndex;
  }

  calculateIndex() {
    this.nextIndex = this.nextIndex + 1;
  }

  removeHashMap(name: string): boolean {
    return this.hashMaps.delete(name);
  }

  // Vérifier si une HashMap existe
  hasHashMap(name: string): boolean {
    return this.hashMaps.has(name);
  }

  // Renommer une HashMap
  renameHashMap(oldName: string, newName: string): boolean {
    if (!this.hashMaps.has(oldName) || this.hashMaps.has(newName)) {
      return false;
    }
    
    const hashMapData = this.hashMaps.get(oldName)!;
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
    const data: any = {
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
  deserialize(data: any): boolean {
    try {
      if (!data.metadata || !data.hashMaps) {
        return false;
      }

      // Nettoyer la collection actuelle
      this.hashMaps.clear();
      this.nextIndex = data.metadata.nextIndex || 0;

      // Restaurer chaque HashMap
      for (const [name, hashMapDataRaw] of Object.entries(data.hashMaps as Record<string, any>)) {
        const bucketManager = new BucketManager();
        const resizeManager = new ResizeManager();
        const skipList = new SkipList();

        const newHashMap = new HashMap(
          this.indexCalculator,
          bucketManager,
          resizeManager,
          skipList
        );

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
    } catch (error) {
      console.error('Error deserializing collection:', error);
      return false;
    }
  }

  findRange(name: string, key: number, min: any, max: any) {
    // TODO: Implémenter la recherche par range avec SkipList
  }
}