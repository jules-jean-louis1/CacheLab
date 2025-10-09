# Cahier des Charges Fonctionnel - CacheLab

## 1. Besoins du Client

### Performances Attendues
- **Temps de réponse** : < 10ms pour les opérations CRUD
- **Complexité temporelle** : O(1) en moyenne pour les opérations de base
- **Gestion mémoire** : Redimensionnement automatique avec load factor optimal (0.75)
- **Concurrent access** : Support de multiples requêtes simultanées

### Cas d'Usage Principaux
1. **Cache de session utilisateur** : Stockage temporaire des données de session
2. **Cache de panier e-commerce** : Gestion des paniers temporaires avant validation
3. **Cache de profils utilisateurs** : Accès rapide aux données fréquemment consultées
4. **Cache temporaire** : Stockage de données avec TTL implicite

## 2. Fonctionnalités Prioritaires

### Opérations CRUD sur Clés/Valeurs
- **CREATE** : `POST /key` - Création de nouvelles paires clé/valeur
- **READ** : `GET /keys/:key` - Récupération d'une valeur par sa clé
- **UPDATE** : `PUT /keys/:key` - Modification d'une valeur existante
- **DELETE** : `DELETE /keys/:key` - Suppression d'une clé
- **LIST** : `GET /keys` - Listage de toutes les clés (optionnel)

### Fonctionnalités Avancées
- **Authentification JWT** : Sécurisation des endpoints
- **Monitoring** : Endpoint pour connaître l'état du cache (`/hashMap/length`)
- **Redimensionnement automatique** : Maintien des performances avec l'augmentation des données

## 3. Contraintes Techniques

### Temps de Réponse
- Opérations CRUD : < 10ms
- Authentification : < 50ms
- Redimensionnement : < 100ms (opération transparente)

### Sécurité
- Authentification obligatoire sur tous les endpoints métier
- Validation des entrées (format clé/valeur)
- Gestion d'erreurs sécurisée (pas de leak d'informations)

### Scalabilité
- Support jusqu'à 100,000 clés en mémoire
- Redimensionnement automatique selon le load factor
- Architecture extensible pour ajout de nouvelles fonctionnalités

## 4. Spécialisation Choisie : Cache In-Memory

### Justification
Le choix d'un **cache in-memory** répond aux besoins suivants :
- **Performance maximale** : Accès direct à la RAM
- **Faible latence** : Pas d'I/O disque
- **Simplicité d'architecture** : Pas de base de données externe
- **Scalabilité horizontale** : Peut être répliqué facilement

### Implications Fonctionnelles
- **Persistance** : Données volatiles (perdues au redémarrage)
- **Capacité** : Limitée par la mémoire vive disponible
- **Cohérence** : Garantie par l'architecture single-threaded de Node.js
- **Durabilité** : Non garantie (acceptable pour un cache)