"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
class Database {
    collection;
    dataDir;
    autoSaveTimer;
    config;
    constructor(collection, config = { autoSave: true, saveInterval: 60000, backupCount: 3 }) {
        this.collection = collection;
        this.dataDir = (0, node_path_1.join)(process.cwd(), 'data');
        this.config = config;
        this.ensureDataDirectory();
        if (this.config.autoSave && this.config.saveInterval) {
            this.startAutoSave();
        }
    }
    // Assurer que le répertoire de données existe
    async ensureDataDirectory() {
        try {
            await node_fs_1.promises.mkdir(this.dataDir, { recursive: true });
        }
        catch (error) {
            console.error('Error creating data directory:', error);
        }
    }
    // Sauvegarder une HashMap spécifique
    async saveHashMap(name) {
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
            const filePath = (0, node_path_1.join)(this.dataDir, fileName);
            // Créer une sauvegarde si le fichier existe
            if (this.config.backupCount && this.config.backupCount > 0) {
                await this.createBackup(filePath);
            }
            await node_fs_1.promises.writeFile(filePath, JSON.stringify(saveData, null, 2), 'utf-8');
            console.log(`HashMap '${name}' saved successfully to ${fileName}`);
            return true;
        }
        catch (error) {
            console.error(`Error saving HashMap '${name}':`, error);
            return false;
        }
    }
    // Sauvegarder toute la collection
    async saveCollection(filename = 'collection.json') {
        try {
            const collectionData = this.collection.serialize();
            const saveData = {
                metadata: {
                    ...collectionData.metadata,
                    savedAt: new Date().toISOString(),
                    format: 'collection'
                },
                collection: collectionData
            };
            const filePath = (0, node_path_1.join)(this.dataDir, filename);
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
            await node_fs_1.promises.writeFile(filePath, content, 'utf-8');
            console.log(`Collection saved successfully to ${filename}`);
            return true;
        }
        catch (error) {
            console.error('Error saving collection:', error);
            return false;
        }
    }
    // Charger une HashMap spécifique
    async loadHashMap(name, filename) {
        try {
            const fileName = filename || `${name}.json`;
            const filePath = (0, node_path_1.join)(this.dataDir, fileName);
            const content = await node_fs_1.promises.readFile(filePath, 'utf-8');
            const saveData = JSON.parse(content);
            if (!saveData.data || !saveData.metadata) {
                throw new Error('Invalid file format');
            }
            // Créer la HashMap dans la collection
            try {
                this.collection.createHashMap(name);
            }
            catch (error) {
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
        }
        catch (error) {
            console.error(`Error loading HashMap '${name}':`, error);
            return false;
        }
    }
    // Charger toute la collection
    async loadCollection(filename = 'collection.json') {
        try {
            const filePath = (0, node_path_1.join)(this.dataDir, filename);
            const content = await node_fs_1.promises.readFile(filePath, 'utf-8');
            let saveData;
            try {
                saveData = JSON.parse(content);
            }
            catch (error) {
                throw new Error('Invalid JSON format');
            }
            if (!saveData.collection) {
                throw new Error('Invalid collection file format');
            }
            const success = this.collection.deserialize(saveData.collection);
            if (success) {
                console.log(`Collection loaded successfully from ${filename}`);
                return true;
            }
            else {
                throw new Error('Failed to deserialize collection data');
            }
        }
        catch (error) {
            console.error('Error loading collection:', error);
            return false;
        }
    }
    // Lister les fichiers de sauvegarde disponibles
    async listSaveFiles() {
        try {
            const files = await node_fs_1.promises.readdir(this.dataDir);
            return files.filter(file => file.endsWith('.json'));
        }
        catch (error) {
            console.error('Error listing save files:', error);
            return [];
        }
    }
    // Créer une sauvegarde d'un fichier existant
    async createBackup(filePath) {
        try {
            const stats = await node_fs_1.promises.stat(filePath);
            if (stats.isFile()) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const backupPath = `${filePath}.backup.${timestamp}`;
                await node_fs_1.promises.copyFile(filePath, backupPath);
                // Nettoyer les vieilles sauvegardes
                await this.cleanOldBackups(filePath);
            }
        }
        catch (error) {
            // Le fichier n'existe pas encore, pas de backup à créer
        }
    }
    // Nettoyer les vieilles sauvegardes
    async cleanOldBackups(originalFilePath) {
        if (!this.config.backupCount || this.config.backupCount <= 0)
            return;
        try {
            const dir = originalFilePath.substring(0, originalFilePath.lastIndexOf('/'));
            const fileName = originalFilePath.substring(originalFilePath.lastIndexOf('/') + 1);
            const files = await node_fs_1.promises.readdir(dir);
            const backupFiles = files
                .filter(file => file.startsWith(`${fileName}.backup.`))
                .map(file => ({
                name: file,
                path: (0, node_path_1.join)(dir, file),
                time: file.substring(file.lastIndexOf('.') + 1)
            }))
                .sort((a, b) => b.time.localeCompare(a.time));
            // Supprimer les vieilles sauvegardes
            const toDelete = backupFiles.slice(this.config.backupCount);
            for (const backup of toDelete) {
                await node_fs_1.promises.unlink(backup.path);
            }
        }
        catch (error) {
            console.error('Error cleaning old backups:', error);
        }
    }
    // Démarrer la sauvegarde automatique
    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        this.autoSaveTimer = setInterval(async () => {
            console.log('Auto-saving collection...');
            await this.saveCollection('collection_auto.json');
        }, this.config.saveInterval);
    }
    // Arrêter la sauvegarde automatique
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = undefined;
        }
    }
    // Exporter en différents formats
    async exportToCSV(hashMapName, filename) {
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
            const filePath = (0, node_path_1.join)(this.dataDir, fileName);
            await node_fs_1.promises.writeFile(filePath, csvContent, 'utf-8');
            console.log(`HashMap '${hashMapName}' exported to CSV: ${fileName}`);
            return true;
        }
        catch (error) {
            console.error(`Error exporting HashMap '${hashMapName}' to CSV:`, error);
            return false;
        }
    }
    // Obtenir des statistiques sur la base de données
    async getDatabaseStats() {
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
        }
        catch (error) {
            console.error('Error getting database stats:', error);
            return null;
        }
    }
    // Nettoyer la base de données (supprimer tous les fichiers)
    async cleanDatabase() {
        try {
            const files = await node_fs_1.promises.readdir(this.dataDir);
            for (const file of files) {
                await node_fs_1.promises.unlink((0, node_path_1.join)(this.dataDir, file));
            }
            console.log('Database cleaned successfully');
            return true;
        }
        catch (error) {
            console.error('Error cleaning database:', error);
            return false;
        }
    }
    // Changer la configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        if (this.config.autoSave && this.config.saveInterval) {
            this.startAutoSave();
        }
        else {
            this.stopAutoSave();
        }
    }
}
exports.Database = Database;
//# sourceMappingURL=database.js.map