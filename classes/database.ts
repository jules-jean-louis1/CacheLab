import { promises as fs } from "node:fs";
import { join } from "node:path";
import { Collection } from "./collection";
import { PersistenceConfig, DatabaseMetadata } from "../types/types";

export class Database {
  private collection: Collection;
  private dataDir: string;
  private autoSaveTimer?: NodeJS.Timeout;
  private config: PersistenceConfig;

  constructor(collection: Collection, config: PersistenceConfig = { autoSave: true, saveInterval: 60000, backupCount: 3 }) {
    this.collection = collection;
    this.dataDir = join(process.cwd(), 'data');
    this.config = config;
    this.ensureDataDirectory();
    
    if (this.config.autoSave && this.config.saveInterval) {
      this.startAutoSave();
    }
  }

  // Assurer que le répertoire de données existe
  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Error creating data directory:', error);
    }
  }

  // Sauvegarder une HashMap spécifique
  async saveHashMap(name: string): Promise<boolean> {
    try {
      const hashMapData = this.collection.getAllDataFromHashMap(name);
      const metadata = this.collection.getHashMapMetadata(name);
      
      if (!hashMapData || !metadata) {
        throw new Error(`HashMap '${name}' not found`);
      }

      const saveData = {
        metadata: {
          ...metadata,
          savedAt: new Date().toISOString(),
          version: '1.0.0'
        },
        data: hashMapData
      };

      const fileName = `${name}.json`;
      const filePath = join(this.dataDir, fileName);
      
      // Créer une sauvegarde si le fichier existe
      if (this.config.backupCount && this.config.backupCount > 0) {
        await this.createBackup(filePath);
      }
      
      await fs.writeFile(filePath, JSON.stringify(saveData, null, 2), 'utf-8');
      console.log(`HashMap '${name}' saved successfully to ${fileName}`);
      return true;
    } catch (error) {
      console.error(`Error saving HashMap '${name}':`, error);
      return false;
    }
  }

  // Sauvegarder toute la collection
  async saveCollection(filename: string = 'collection.json'): Promise<boolean> {
    try {
      const collectionData = this.collection.serialize();
      
      const saveData = {
        metadata: {
          ...collectionData.metadata,
          savedAt: new Date().toISOString(),
          format: 'collection'
        } as DatabaseMetadata,
        collection: collectionData
      };

      const filePath = join(this.dataDir, filename);
      
      // Créer une sauvegarde si le fichier existe
      if (this.config.backupCount && this.config.backupCount > 0) {
        await this.createBackup(filePath);
      }
      
      let content = JSON.stringify(saveData, null, 2);
      
      // Compression optionnelle
      if (this.config.compression) {
        // Implémentation simple de compression (vous pourriez utiliser une vraie lib comme zlib)
        content = JSON.stringify(saveData);
      }
      
      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`Collection saved successfully to ${filename}`);
      return true;
    } catch (error) {
      console.error('Error saving collection:', error);
      return false;
    }
  }

  // Charger une HashMap spécifique
  async loadHashMap(name: string, filename?: string): Promise<boolean> {
    try {
      const fileName = filename || `${name}.json`;
      const filePath = join(this.dataDir, fileName);
      
      const content = await fs.readFile(filePath, 'utf-8');
      const saveData = JSON.parse(content);
      
      if (!saveData.data || !saveData.metadata) {
        throw new Error('Invalid file format');
      }
      
      // Créer la HashMap dans la collection
      try {
        this.collection.createHashMap(name);
      } catch (error) {
        // HashMap existe déjà, la supprimer et recréer
        this.collection.removeHashMap(name);
        this.collection.createHashMap(name);
      }
      
      // Charger les données
      for (const item of saveData.data) {
        if (item.key !== undefined && item.value !== undefined) {
          this.collection.addToCollection(name, item.key, item.value);
        }
      }
      
      console.log(`HashMap '${name}' loaded successfully from ${fileName}`);
      return true;
    } catch (error) {
      console.error(`Error loading HashMap '${name}':`, error);
      return false;
    }
  }

  // Charger toute la collection
  async loadCollection(filename: string = 'collection.json'): Promise<boolean> {
    try {
      const filePath = join(this.dataDir, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      
      let saveData;
      try {
        saveData = JSON.parse(content);
      } catch (error) {
        throw new Error('Invalid JSON format');
      }
      
      if (!saveData.collection) {
        throw new Error('Invalid collection file format');
      }
      
      const success = this.collection.deserialize(saveData.collection);
      if (success) {
        console.log(`Collection loaded successfully from ${filename}`);
        return true;
      } else {
        throw new Error('Failed to deserialize collection data');
      }
    } catch (error) {
      console.error('Error loading collection:', error);
      return false;
    }
  }

  // Lister les fichiers de sauvegarde disponibles
  async listSaveFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.dataDir);
      return files.filter(file => file.endsWith('.json'));
    } catch (error) {
      console.error('Error listing save files:', error);
      return [];
    }
  }

  // Créer une sauvegarde d'un fichier existant
  private async createBackup(filePath: string): Promise<void> {
    try {
      const stats = await fs.stat(filePath);
      if (stats.isFile()) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = `${filePath}.backup.${timestamp}`;
        await fs.copyFile(filePath, backupPath);
        
        // Nettoyer les vieilles sauvegardes
        await this.cleanOldBackups(filePath);
      }
    } catch (error) {
      // Le fichier n'existe pas encore, pas de backup à créer
    }
  }

  // Nettoyer les vieilles sauvegardes
  private async cleanOldBackups(originalFilePath: string): Promise<void> {
    if (!this.config.backupCount || this.config.backupCount <= 0) return;
    
    try {
      const dir = originalFilePath.substring(0, originalFilePath.lastIndexOf('/'));
      const fileName = originalFilePath.substring(originalFilePath.lastIndexOf('/') + 1);
      const files = await fs.readdir(dir);
      
      const backupFiles = files
        .filter(file => file.startsWith(`${fileName}.backup.`))
        .map(file => ({
          name: file,
          path: join(dir, file),
          time: file.substring(file.lastIndexOf('.') + 1)
        }))
        .sort((a, b) => b.time.localeCompare(a.time));
      
      // Supprimer les vieilles sauvegardes
      const toDelete = backupFiles.slice(this.config.backupCount);
      for (const backup of toDelete) {
        await fs.unlink(backup.path);
      }
    } catch (error) {
      console.error('Error cleaning old backups:', error);
    }
  }

  // Démarrer la sauvegarde automatique
  private startAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setInterval(async () => {
      console.log('Auto-saving collection...');
      await this.saveCollection('collection_auto.json');
    }, this.config.saveInterval);
  }

  // Arrêter la sauvegarde automatique
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = undefined;
    }
  }

  // Exporter en différents formats
  async exportToCSV(hashMapName: string, filename?: string): Promise<boolean> {
    try {
      const data = this.collection.getAllDataFromHashMap(hashMapName);
      if (!data) {
        throw new Error(`HashMap '${hashMapName}' not found`);
      }
      
      const csvContent = [
        'key,value',
        ...data.map(item => `"${item.key}","${JSON.stringify(item.value).replace(/"/g, '""')}"`)
      ].join('\n');
      
      const fileName = filename || `${hashMapName}.csv`;
      const filePath = join(this.dataDir, fileName);
      
      await fs.writeFile(filePath, csvContent, 'utf-8');
      console.log(`HashMap '${hashMapName}' exported to CSV: ${fileName}`);
      return true;
    } catch (error) {
      console.error(`Error exporting HashMap '${hashMapName}' to CSV:`, error);
      return false;
    }
  }

  // Obtenir des statistiques sur la base de données
  async getDatabaseStats(): Promise<any> {
    try {
      const files = await this.listSaveFiles();
      const collectionStats = this.collection.getStats();
      
      return {
        dataDirectory: this.dataDir,
        saveFiles: files,
        totalSaveFiles: files.length,
        autoSaveEnabled: this.config.autoSave,
        saveInterval: this.config.saveInterval,
        backupCount: this.config.backupCount,
        ...collectionStats
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return null;
    }
  }

  // Nettoyer la base de données (supprimer tous les fichiers)
  async cleanDatabase(): Promise<boolean> {
    try {
      const files = await fs.readdir(this.dataDir);
      for (const file of files) {
        await fs.unlink(join(this.dataDir, file));
      }
      console.log('Database cleaned successfully');
      return true;
    } catch (error) {
      console.error('Error cleaning database:', error);
      return false;
    }
  }

  // Changer la configuration
  updateConfig(newConfig: Partial<PersistenceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.autoSave && this.config.saveInterval) {
      this.startAutoSave();
    } else {
      this.stopAutoSave();
    }
  }
}
