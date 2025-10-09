# Cahier des Charges Techniques - CacheLab

## 1. Langage Choisi : Node.js/TypeScript

### Justification Argumentée

#### Critères de Performance
- **Event Loop Non-Bloquant** : Idéal pour les opérations I/O intensives (API REST)
- **Complexité O(1)** : HashMap native optimisée par V8
- **Faible Overhead Mémoire** : Gestion automatique de la mémoire par V8
- **Concurrence** : Architecture single-threaded évite les race conditions

#### Facilité de Développement
- **TypeScript** : Typage statique améliore la maintenabilité
- **Écosystème Mature** : npm, debugging tools, IDE support
- **Syntaxe Familière** : Proche du JavaScript, courbe d'apprentissage faible
- **Développement Rapide** : Hot reload, tooling avancé

#### Écosystème Disponible
- **Fastify** : Framework performant pour APIs REST
- **jsonwebtoken** : Authentification JWT standardisée
- **ts-node** : Exécution directe TypeScript en développement
- **nodemon** : Auto-reload pour le développement

### Comparaison avec Go
| Critère | Node.js/TypeScript | Go |
|---------|-------------------|-----|
| Performance CPU | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Performance I/O | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Facilité dev | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Écosystème | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Total** | **18/20** | **16/20** |

## 2. Architecture Applicative

### Vue d'Ensemble
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client HTTP   │───▶│   Fastify API   │───▶│  HashMap Core   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                         │
                              ▼                         ▼
                    ┌─────────────────┐    ┌─────────────────┐
                    │  Auth Guard     │    │  Bucket Manager │
                    │  (JWT)          │    │  Resize Manager │
                    └─────────────────┘    └─────────────────┘
```

### Composants Principaux

#### 1. Serveur API REST (Fastify)
- **Port** : 8080
- **Logging** : Intégré Fastify
- **Middleware** : Authentication guard
- **Format** : JSON requests/responses

#### 2. Module de Stockage en Mémoire
- **HashMap** : Structure principale de données
- **BucketManager** : Gestion des collisions (chaînage)
- **ResizeManager** : Redimensionnement automatique
- **Hasher** : Fonction de hachage personnalisée
- **IndexCalculator** : Calcul d'index avec modulo

#### 3. Système d'Authentification
- **JWT Tokens** : Authentification stateless
- **Auth Guard** : Middleware de protection des endpoints
- **Expire Time** : Gestion de l'expiration des tokens

#### 4. Composants Utilitaires
- **HashMapIterator** : Pattern Iterator pour parcours
- **Utils** : Fonctions utilitaires (génération JWT)
- **Types** : Définitions TypeScript centralisées

## 3. Structure de Données : HashMap

### Justification du Choix

#### HashMap vs Autres Structures
| Structure | Complexité | Avantages | Inconvénients |
|-----------|------------|-----------|---------------|
| **HashMap** | O(1) avg | Très rapide, flexible | Collision handling |
| Array trié | O(log n) | Ordonné, prévisible | Plus lent pour CRUD |
| Array simple | O(n) | Simple à implémenter | Très lent à l'échelle |

#### Implémentation Détaillée

**Fonction de Hachage** :
```typescript
// Algorithme personnalisé basé sur les codes ASCII
hash(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) % 1000000007;
  }
  return Math.abs(hash);
}
```

**Gestion des Collisions** :
- **Méthode** : Chaînage (Array de Arrays)
- **Structure** : `buckets[index] = [{key: value}, {key2: value2}, ...]`
- **Recherche** : Parcours linéaire dans le bucket

**Redimensionnement Automatique** :
- **Load Factor** : 0.75 (seuil de redimensionnement)
- **Stratégie** : Doublement de la taille (10 → 20 → 40...)
- **Re-hashing** : Recalcul de tous les index lors du resize

## 4. Endpoints API Détaillés

### Authentication
```http
POST /auth/login
Content-Type: application/json

Response 200:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### CRUD Operations

#### CREATE - Créer une nouvelle clé/valeur
```http
POST /key
Authorization: Bearer <token>
Content-Type: application/json

{
  "user:123": {"name": "John", "age": 30},
  "session:abc": {"active": true, "startTime": "2025-01-01T10:00:00Z"}
}

Response 200:
{
  "message": "Keys added successfully",
  "hashMapState": [...]
}
```

#### READ - Récupérer la valeur d'une clé
```http
GET /keys/user:123
Authorization: Bearer <token>

Response 200:
{
  "keyFind": {"name": "John", "age": 30}
}

Response 404:
{
  "keyFind": null
}
```

#### UPDATE - Modifier la valeur d'une clé existante
```http
PUT /keys/user:123
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "age": 31
}

Response 200:
{
  "message": "Key updated successfully"
}
```

#### DELETE - Supprimer une clé
```http
DELETE /keys/user:123
Authorization: Bearer <token>

Response 200:
{
  "message": "Key deleted successfully",
  "key": "user:123"
}

Response 404:
{
  "error": "Key not found"
}
```

#### LIST - Lister toutes les clés
```http
GET /keys
Authorization: Bearer <token>

Response 200:
{
  "count": 5,
  "dump": [
    {"user:123": {"name": "John", "age": 30}},
    {"session:abc": {"active": true}},
    ...
  ]
}
```

### Monitoring
```http
GET /hashMap/length
Authorization: Bearer <token>

Response 200:
{
  "hashMapLength": 20
}
```

```http
GET /hashMap
Authorization: Bearer <token>

Response 200:
{
  "hashMap": [[], [{"key": "value"}], [], ...]
}
```

## 5. Mesures de Sécurité

### Authentification
- **JWT Tokens** : Authentification stateless sécurisée
- **Bearer Token** : Standard HTTP Authorization
- **Expiration** : Tokens avec durée de vie limitée
- **Secret Key** : Clé secrète pour signature JWT

### Validation des Entrées
- **Type Checking** : TypeScript pour validation statique
- **JSON Parsing** : Validation automatique par Fastify
- **Key Format** : Validation format string pour les clés
- **Content Validation** : Vérification de la structure des données

### Gestion des Erreurs
- **Status Codes** : Codes HTTP appropriés (200, 404, 401, 500)
- **Error Messages** : Messages d'erreur informatifs sans leak
- **Logging** : Journalisation des erreurs pour debugging
- **Exception Handling** : Try/catch pour prévenir les crashes

### Protection des Endpoints
- **Auth Guard** : Middleware de protection sur tous les endpoints métier
- **CORS** : Configuration appropriée pour les requêtes cross-origin
- **Rate Limiting** : (À implémenter) Protection contre le spam
- **Input Sanitization** : (À implémenter) Nettoyage des entrées utilisateur

## 6. Performance et Optimisations

### Métriques Cibles
- **Latence** : < 10ms pour opérations CRUD
- **Throughput** : > 1000 req/sec
- **Mémoire** : Utilisation optimale avec redimensionnement
- **CPU** : Faible consommation grâce à l'efficacité O(1)

### Optimisations Implémentées
- **HashMap Sizing** : Redimensionnement automatique selon load factor
- **Collision Handling** : Chaînage efficace avec parcours optimisé
- **Memory Management** : GC automatique de Node.js
- **Event Loop** : Architecture non-bloquante pour concurrence