# Cahier des Charges Techniques - CacheLab

## Choix du Langage : Node.js/TypeScript

Le choix de Node.js avec TypeScript s'appuie sur une analyse multicritère prenant en compte les performances, la facilité de développement et l'écosystème disponible. 

En termes de performance, l'event loop non-bloquant de Node.js s'avère idéal pour les opérations intensives d'entrée/sortie caractéristiques des API REST. Le moteur V8 optimise nativement les structures de type HashMap, garantissant une complexité O(1) pour les opérations de base. La gestion automatique de la mémoire par V8 réduit l'overhead mémoire tout en évitant les fuites mémoire. L'architecture single-threaded élimine naturellement les race conditions dans un contexte de cache partagé.

La facilité de développement constitue un avantage majeur avec TypeScript qui apporte un typage statique améliorant significativement la maintenabilité du code. L'écosystème mature offre des outils de debugging avancés et un support IDE complet. La syntaxe proche du JavaScript réduit la courbe d'apprentissage, tandis que les outils comme hot reload et nodemon accélèrent le cycle de développement.

L'écosystème disponible présente des solutions éprouvées comme Fastify pour les API REST haute performance, jsonwebtoken pour l'authentification JWT standardisée, ts-node pour l'exécution directe du TypeScript en développement, et de nombreux packages npm spécialisés. Comparativement à Go, Node.js/TypeScript obtient un score global de 18/20 contre 16/20, principalement grâce à sa supériorité en facilité de développement et écosystème, compensant un léger désavantage en performance CPU pure.

## Architecture Applicative

L'architecture suit un modèle en couches avec séparation claire des responsabilités. Le serveur API REST basé sur Fastify constitue la couche de présentation, exposant les endpoints sur le port 8080 avec logging intégré et gestion des requêtes/réponses JSON. Un middleware d'authentification protège systématiquement tous les endpoints métier.

Le module de stockage en mémoire forme le cœur technique avec une HashMap custom comme structure principale de données. La gestion des collisions s'effectue par chaînage via un BucketManager dédié, tandis qu'un ResizeManager assure le redimensionnement automatique selon le load factor. Une fonction de hachage personnalisée et un IndexCalculator optimisent la distribution et le calcul d'index par modulo.

Le système d'authentification repose sur des tokens JWT pour une approche stateless, avec un Auth Guard middleware qui protège l'ensemble des endpoints sensibles. La gestion de l'expiration des tokens maintient un niveau de sécurité approprié sans surcharge administrative.

Les composants utilitaires incluent un HashMapIterator implémentant le pattern Iterator pour le parcours optimisé de la structure, des fonctions utilitaires centralisées notamment pour la génération JWT, et des définitions TypeScript centralisées garantissant la cohérence des types à travers l'application.

## Structure de Données HashMap

Le choix de la HashMap comme structure principale se justifie par sa complexité temporelle O(1) en moyenne, nettement supérieure aux alternatives comme les arrays triés O(log n) ou les arrays simples O(n). Cette performance s'avère cruciale pour un système de cache haute performance où chaque milliseconde compte.

L'implémentation utilise une fonction de hachage personnalisée basée sur les codes ASCII avec un algorithme polynomial modulo un nombre premier large pour garantir une distribution uniforme. Chaque caractère de la clé contribue au calcul par multiplication par 31 et addition du code ASCII, le résultat étant normalisé par modulo 1000000007 pour éviter les débordements.

La gestion des collisions s'effectue par chaînage avec des arrays imbriqués, où chaque bucket contient un array d'objets représentant les paires clé/valeur. Cette approche privilégie la simplicité d'implémentation tout en maintenant des performances acceptables même en cas de collisions multiples. La recherche dans un bucket s'effectue par parcours linéaire, acceptable given la distribution uniforme attendue.

Le redimensionnement automatique maintient un load factor optimal de 0.75, déclenchant un doublement de la taille des buckets et un re-hashing complet de toutes les entrées existantes. Cette stratégie préserve les performances en évitant la dégradation due à des buckets surchargés, au prix d'une opération ponctuelle plus coûteuse mais transparente pour l'utilisateur.

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