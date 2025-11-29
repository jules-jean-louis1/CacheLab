# 🚀 CacheLab - Advanced HashMap Collection API

Une API REST avancée pour gérer des collections de HashMaps avec persistence, validation et gestion d'erreurs complète.

## ✨ Nouvelles fonctionnalités implémentées

### 🔄 **Phase 2: Améliorations de l'API**
- ✅ **Validation des données d'entrée** complète avec messages d'erreur détaillés
- ✅ **Gestion des erreurs standardisée** avec codes de statut HTTP appropriés
- ✅ **Réponses API uniformisées** avec format JSON cohérent
- ✅ **Middleware de gestion d'erreurs globales**

### 🚀 **Phase 3: Nouvelles fonctionnalités**
- ✅ **Endpoints de sauvegarde/chargement complets** pour HashMaps individuelles et collections
- ✅ **Gestion des métadonnées** avec timestamps et statistiques
- ✅ **Export CSV** pour les HashMaps
- ✅ **Renommage des HashMaps**
- ✅ **Health checks** et monitoring

### ⚡ **Phase 4: Optimisations**
- ✅ **Persistence automatique** avec sauvegarde périodique
- ✅ **Types TypeScript améliorés** pour une meilleure sécurité de type
- ✅ **Gestion des sauvegardes** avec rotation automatique
- ✅ **Gestion propre de l'arrêt** du serveur
- ✅ **Statistiques globales** et monitoring

## 📚 Documentation de l'API

### 🔐 Authentication

#### `POST /auth/login`
Génère un token JWT pour l'authentification.

**Réponse:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "token": "jwt_token_here" },
  "statusCode": 200,
  "timestamp": "2025-11-27T10:00:00.000Z"
}
```

### 📦 Gestion des Collections

#### `POST /hashMap`
Crée une nouvelle HashMap dans la collection.

**Body:**
```json
{
  "name": "mon_hashmap",
  "initialData": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

#### `GET /hashMaps`
Liste toutes les HashMaps avec leurs métadonnées.

#### `GET /hashMap/:name`
Récupère une HashMap spécifique avec ses données et métadonnées.

#### `DELETE /hashMap/:name`
Supprime une HashMap de la collection.

#### `PATCH /hashMap/:name/rename`
Renomme une HashMap existante.

**Body:**
```json
{
  "newName": "nouveau_nom"
}
```

### 🔑 Opérations sur les Clés-Valeurs

#### `POST /hashMap/:name/keys`
Ajoute des clés-valeurs à une HashMap.

**Body:**
```json
{
  "key1": "value1",
  "key2": { "nested": "object" },
  "key3": 123
}
```

#### `GET /hashMap/:name/keys/:key`
Récupère la valeur d'une clé spécifique.

#### `PUT /hashMap/:name/keys/:key`
Met à jour la valeur d'une clé.

**Body:**
```json
{
  "value": "nouvelle_valeur"
}
```

#### `DELETE /hashMap/:name/keys/:key`
Supprime une clé et sa valeur.

### 💾 Persistence

#### `POST /hashMap/:name/save`
Sauvegarde une HashMap spécifique dans un fichier JSON.

#### `POST /hashMap/load`
Charge une HashMap depuis un fichier.

**Body:**
```json
{
  "name": "nom_hashmap",
  "filename": "fichier_optionnel.json"
}
```

#### `POST /collection/save`
Sauvegarde toute la collection.

**Body:**
```json
{
  "filename": "collection_backup.json"
}
```

#### `POST /collection/load`
Charge une collection complète depuis un fichier.

#### `GET /saves`
Liste tous les fichiers de sauvegarde disponibles.

### 📊 Statistiques et Gestion

#### `GET /stats`
Récupère les statistiques globales de la collection et de la base de données.

**Réponse:**
```json
{
  "success": true,
  "data": {
    "collection": {
      "totalHashMaps": 5,
      "totalElements": 150,
      "totalBuckets": 50,
      "averageElementsPerHashMap": 30
    },
    "database": {
      "dataDirectory": "./data",
      "saveFiles": ["collection.json", "cart_user.json"],
      "autoSaveEnabled": true,
      "saveInterval": 300000
    }
  }
}
```

#### `POST /hashMap/:name/export/csv`
Exporte une HashMap au format CSV.

#### `PUT /config/persistence`
Configure les paramètres de persistence.

**Body:**
```json
{
  "autoSave": true,
  "saveInterval": 300000,
  "backupCount": 5,
  "compression": false
}
```

#### `GET /health`
Vérifie l'état de santé du service.

## 🔧 Configuration

### Variables d'environnement
```bash
PORT=8080                    # Port du serveur (défaut: 8080)
DATA_DIR=./data             # Répertoire de données
AUTO_SAVE=true              # Sauvegarde automatique
SAVE_INTERVAL=300000        # Interval de sauvegarde (5 min)
BACKUP_COUNT=5              # Nombre de sauvegardes à conserver
```

### Configuration de persistence
```typescript
{
  autoSave: boolean;          // Activer la sauvegarde automatique
  saveInterval?: number;      // Intervalle en millisecondes
  backupCount?: number;       // Nombre de backups à conserver
  compression?: boolean;      // Compression des fichiers JSON
}
```

## 🛡️ Validation

### Noms de HashMap
- ✅ Requis et de type string
- ✅ Longueur entre 1-50 caractères
- ✅ Caractères autorisés: lettres, chiffres, tirets, underscores

### Clés
- ✅ Requises et de type string
- ✅ Longueur entre 1-100 caractères
- ✅ Non vides

### Valeurs
- ✅ Ne peuvent pas être `undefined`
- ✅ Doivent être sérialisables en JSON
- ✅ Taille maximum: 10KB sérialisé

## 📋 Format de Réponse Standardisé

### Succès
```json
{
  "success": true,
  "message": "Opération réussie",
  "data": { /* données */ },
  "statusCode": 200,
  "timestamp": "2025-11-27T10:00:00.000Z"
}
```

### Erreur
```json
{
  "success": false,
  "error": "Message d'erreur",
  "statusCode": 400,
  "timestamp": "2025-11-27T10:00:00.000Z",
  "details": { /* détails optionnels */ }
}
```

### Erreur de Validation
```json
{
  "success": false,
  "error": "Validation failed",
  "statusCode": 400,
  "timestamp": "2025-11-27T10:00:00.000Z",
  "details": {
    "validationErrors": [
      "Name cannot be empty",
      "Key 'invalid_key': Key cannot exceed 100 characters"
    ]
  }
}
```

## 🚀 Démarrage

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev

# Build et démarrage
npm run build
npm start
```

## 📁 Structure des Fichiers de Données

### HashMap individuelle
```json
{
  "metadata": {
    "id": 1,
    "name": "cart_user",
    "createdAt": "2025-11-27T10:00:00.000Z",
    "updatedAt": "2025-11-27T10:30:00.000Z",
    "lastAccessed": "2025-11-27T10:35:00.000Z",
    "elementCount": 5,
    "bucketCount": 10,
    "savedAt": "2025-11-27T10:40:00.000Z",
    "version": "1.0.0"
  },
  "data": [
    { "key": "user_1", "value": { "name": "John", "items": 3 } },
    { "key": "user_2", "value": { "name": "Jane", "items": 1 } }
  ]
}
```

### Collection complète
```json
{
  "metadata": {
    "version": "1.0.0",
    "savedAt": "2025-11-27T10:40:00.000Z",
    "format": "collection"
  },
  "collection": {
    "metadata": {
      "version": "1.0.0",
      "createdAt": "2025-11-27T10:40:00.000Z",
      "totalHashMaps": 2,
      "nextIndex": 2
    },
    "hashMaps": {
      "cart_user": { /* données HashMap */ },
      "session_cache": { /* données HashMap */ }
    }
  }
}
```

## 🔄 Améliorations Apportées

1. **Architecture SRP Respectée**: Méthodes proxy dans Collection pour encapsuler les opérations
2. **Gestion d'erreurs robuste**: Try-catch sur tous les endpoints avec messages descriptifs
3. **Validation complète**: Validation des entrées à tous les niveaux
4. **Persistence avancée**: Sauvegarde automatique, backups rotatifs, export CSV
5. **Monitoring**: Health checks, statistiques détaillées
6. **Types TypeScript**: Interfaces complètes pour toutes les structures de données
7. **Métadonnées**: Timestamps, compteurs, derniers accès
8. **Configuration flexible**: Paramètres de persistence configurables à chaud

L'API est maintenant prête pour la production avec une architecture robuste et des fonctionnalités avancées ! 🎉