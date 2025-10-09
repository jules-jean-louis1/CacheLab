# Tests de l'Endpoint DELETE

## Test avec curl

Maintenant que l'endpoint DELETE est implémenté, vous pouvez le tester :

```bash
# 1. D'abord, démarrer le serveur
npm run dev

# 2. Dans un autre terminal, obtenir un token
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login | jq -r '.token')

# 3. Ajouter une clé de test
curl -d '{"test:delete": {"value": "to be deleted"}}' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -X POST http://localhost:8080/key

# 4. Vérifier que la clé existe
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/keys/test:delete

# 5. Supprimer la clé
curl -s -H "Authorization: Bearer $TOKEN" \
  -X DELETE http://localhost:8080/keys/test:delete

# 6. Vérifier que la clé n'existe plus (doit retourner null)
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/keys/test:delete

# 7. Essayer de supprimer une clé inexistante (doit retourner 404)
curl -s -H "Authorization: Bearer $TOKEN" \
  -X DELETE http://localhost:8080/keys/nonexistent
```

## Réponses Attendues

**Suppression réussie (200)** :
```json
{
  "message": "Key deleted successfully",
  "key": "test:delete"
}
```

**Clé non trouvée (404)** :
```json
{
  "error": "Key not found"
}
```