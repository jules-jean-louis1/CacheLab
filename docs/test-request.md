```bash
# Authentication
curl -X POST http://localhost:8080/auth/login

# Ajouter des données variées pour tester le cache

# Première série - différents utilisateurs
curl -d '{"cart:user_001": [{"id_produit": "livre_123", "quantite": 1, "prix": 15.99}]}' -H "Content-Type: application/json" -X POST http://localhost:8080/key -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjAxMDE0OTg4LCJkYXRhIjoiYXV0aF9jYWNoZWxhYiIsImlhdCI6MTc2MDEwMTEzOH0.Ly5hoWHLnI_L5pH9fcR-0JyQcy2-OeTnyltmyc0Iuck"

curl -d '{"cart:user_010": [{"id_produit": "stylo_456", "quantite": 3, "prix": 2.50}]}' -H "Content-Type: application/json" -X POST http://localhost:8080/key -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjAxMDE0OTg4LCJkYXRhIjoiYXV0aF9jYWNoZWxhYiIsImlhdCI6MTc2MDEwMTEzOH0.Ly5hoWHLnI_L5pH9fcR-0JyQcy2-OeTnyltmyc0Iuck"

curl -d '{"cart:user_100": [{"id_produit": "cahier_789", "quantite": 2, "prix": 8.00}]}' -H "Content-Type: application/json" -X POST http://localhost:8080/key

# Deuxième série - différents préfixes
curl -d '{"session:abc123": [{"id_produit": "produit_A", "quantite": 1, "prix": 25.00}]}' -H "Content-Type: application/json" -X POST http://localhost:8080/key

curl -d '{"order:def456": [{"id_produit": "produit_B", "quantite": 2, "prix": 12.50}]}' -H "Content-Type: application/json" -X POST http://localhost:8080/key

curl -d '{"temp:ghi789": [{"id_produit": "produit_C", "quantite": 1, "prix": 30.00}]}' -H "Content-Type: application/json" -X POST http://localhost:8080/key

# Troisième série - variations sur le même thème
curl -d '{"user_profile_001": [{"setting": "theme", "value": "dark"}]}' -H "Content-Type: application/json" -X POST http://localhost:8080/key

curl -d '{"user_profile_010": [{"setting": "language", "value": "fr"}]}' -H "Content-Type: application/json" -X POST http://localhost:8080/key

curl -d '{"user_profile_100": [{"setting": "notifications", "value": true}]}' -H "Content-Type: application/json" -X POST http://localhost:8080/key

# Quatrième série - clés courtes
curl -d '{"a": [{"test": "value1"}]}' -H "Content-Type: application/json" -X POST http://localhost:8080/key

curl -d '{"b": [{"test": "value2"}]}' -H "Content-Type: application/json" -X POST http://localhost:8080/key

curl -d '{"c": [{"test": "value3"}]}' -H "Content-Type: application/json" -X POST http://localhost:8080/key
```



```bash
curl -d '{"user:001": [{"action": "login", "time": "10:00"}]}' -H "Content-Type: application/json" -X POST http://localhost:8080/key
curl -d '{"user:002": [{"action": "view_product", "product_id": "123"}]}' -H "Content-Type: application/json" -X POST http://localhost:8080/key
curl -d '{"session:abc": [{"start_time": "09:00", "active": true}]}' -H "Content-Type: application/json" -X POST http://localhost:8080/key
curl -d '{"cart:temp_001": [{"item": "book", "qty": 2}]}' -H "Content-Type: application/json" -X POST http://localhost:8080/key
curl -d '{"order:12345": [{"status": "pending", "total": 89.99}]}' -H "Content-Type: application/json" -X POST http://localhost:8080/key
curl -d '{"profile:john": [{"age": 25, "city": "Paris"}]}' -H "Content-Type: application/json" -X POST http://localhost:8080/key
curl -d '{"temp:data_001": [{"type": "cache", "ttl": 3600}]}' -H "Content-Type: application/json" -X POST http://localhost:8080/key 
```

# Élément 8 - Load factor: 8/10 = 0.8 > 0.75 → REDIMENSIONNEMENT !
```bash
curl -d '{"analytics:visitor_001": [{"page": "home", "duration": 45}]}' -H "Content-Type: application/json" -X POST http://localhost:8080/key
```

```bash
curl -X DELETE http://localhost:8080/keys/cart:user_001 -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjAxMDE0OTg4LCJkYXRhIjoiYXV0aF9jYWNoZWxhYiIsImlhdCI6MTc2MDEwMTEzOH0.Ly5hoWHLnI_L5pH9fcR-0JyQcy2-OeTnyltmyc0Iuck"

```
// Mettre en place un time to live et la sauvegarde persistante avec fs.writeFileSync et fs.readFileSync
// Faire un orm a la main, un bucket S3 aussi.