# Cahier des Charges Fonctionnel - CacheLab

## Besoins du Client

Le système CacheLab doit répondre à des exigences de performance élevées avec des temps de réponse inférieurs à 10 millisecondes pour l'ensemble des opérations CRUD. La complexité temporelle attendue est de O(1) en moyenne pour garantir une scalabilité optimale. Le système doit supporter efficacement les accès concurrents multiples tout en maintenant une gestion mémoire intelligente par redimensionnement automatique avec un load factor optimal fixé à 0.75.

Les cas d'usage principaux concernent le stockage temporaire de données de session utilisateur, la gestion de paniers e-commerce avant validation, l'accès rapide aux profils utilisateurs fréquemment consultés, et plus généralement tout stockage de données avec une durée de vie implicite. Le système vise à remplacer les solutions de cache traditionnelles par une implémentation custom hautement optimisée.

## Fonctionnalités Prioritaires

Le cœur fonctionnel repose sur les opérations CRUD complètes via une API REST. La création de nouvelles paires clé/valeur s'effectue par requête POST sur l'endpoint /key, permettant l'insertion de données structurées en JSON. La récupération des valeurs utilise un endpoint GET paramétré /keys/:key pour un accès direct et rapide. La modification des valeurs existantes passe par un endpoint PUT /keys/:key maintenant la cohérence des données. La suppression s'opère via DELETE /keys/:key avec confirmation de l'opération. Une fonctionnalité optionnelle de listage global est disponible sur GET /keys pour les besoins d'administration.

L'authentification JWT sécurise l'ensemble des endpoints métier, garantissant un accès contrôlé aux données sensibles. Un système de monitoring intégré expose l'état du cache via des endpoints dédiés comme /hashMap/length. Le redimensionnement automatique de la structure interne maintient les performances lors de l'augmentation du volume de données sans intervention manuelle.

## Contraintes Techniques

Les contraintes de performance imposent des temps de réponse stricts avec moins de 10 millisecondes pour les opérations CRUD, moins de 50 millisecondes pour l'authentification, et moins de 100 millisecondes pour les opérations de redimensionnement qui doivent rester transparentes pour l'utilisateur final.

La sécurité exige une authentification obligatoire sur tous les endpoints métier, une validation rigoureuse des formats clé/valeur en entrée, et une gestion d'erreurs sécurisée qui ne révèle aucune information sensible sur l'architecture interne. 

La scalabilité doit permettre le support d'au moins 100 000 clés en mémoire avec un redimensionnement automatique basé sur le load factor. L'architecture modulaire facilite l'ajout de nouvelles fonctionnalités sans impact sur les performances existantes.

## Spécialisation Cache In-Memory

Le choix d'un cache in-memory se justifie par la recherche de performances maximales grâce à l'accès direct à la RAM, éliminant toute latence liée aux opérations d'entrée/sortie disque. Cette approche simplifie considérablement l'architecture en évitant la dépendance à une base de données externe, tout en offrant une scalabilité horizontale par réplication facile sur plusieurs instances.

Cette spécialisation implique que les données sont volatiles et perdues au redémarrage du système, ce qui est acceptable dans un contexte de cache. La capacité est naturellement limitée par la mémoire vive disponible, mais la cohérence est garantie par l'architecture single-threaded de Node.js. L'absence de durabilité persistante constitue un compromis acceptable au regard des performances obtenues et de la simplicité d'implémentation.