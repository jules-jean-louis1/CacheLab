# CacheLab 🚀

Système de cache haute performance implémenté from scratch avec HashMap custom en Node.js/TypeScript.

## ⚡ Quick Start

```bash
# Installation des dépendances
npm install

# Lancement en développement
npm run dev

# Lancement en production
npm run build && npm start
```

## 🏗️ Architecture

- **HashMap Custom** : Structure de données O(1) avec gestion des collisions
- **API REST** : Endpoints CRUD sécurisés avec JWT
- **Redimensionnement Auto** : Load factor 0.75 pour performances optimales
- **TypeScript** : Code typé et maintenable

## 🔧 API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/auth/login` | Obtenir un token JWT |
| `POST` | `/key` | Créer clé/valeur |
| `GET` | `/keys/:key` | Lire une valeur |
| `PUT` | `/keys/:key` | Modifier une valeur |
| `DELETE` | `/keys/:key` | Supprimer une clé |
| `GET` | `/keys` | Lister toutes les clés |

## 🚀 Usage Rapide

```bash
# 1. Obtenir un token
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login | jq -r '.token')

# 2. Ajouter des données
curl -d '{"user:123": {"name": "John", "age": 30}}' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -X POST http://localhost:8080/key

# 3. Lire les données
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/keys/user:123

# 4. Supprimer
curl -H "Authorization: Bearer $TOKEN" \
  -X DELETE http://localhost:8080/keys/user:123
```

## 📊 Performance

- **Complexité** : O(1) moyenne pour toutes les opérations CRUD
- **Latence** : < 10ms par opération
- **Redimensionnement** : Automatique selon load factor
- **Concurrence** : Architecture non-bloquante Node.js

## 📁 Structure

```
classes/          # Classes métier HashMap
├── hashmap.ts           # Structure principale
├── bucketManager.ts     # Gestion collisions  
├── hasher.ts           # Fonction de hachage
└── resizeManager.ts    # Redimensionnement

controllers/      # Contrôleurs API
docs/            # Documentation technique
```

## 🔒 Sécurité

- **JWT Authentication** : Tous les endpoints protégés
- **Validation** : Types TypeScript + validation Fastify
- **Error Handling** : Gestion d'erreurs sécurisée

---

**Stack** : Node.js + TypeScript + Fastify + JWT