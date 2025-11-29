"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BucketManager = void 0;
class BucketManager {
    constructor() { }
    add(hashMap, index, key, content) {
        try {
            // S'assurer que le bucket existe
            if (!hashMap[index]) {
                hashMap[index] = [];
            }
            // Vérifier si la clé existe déjà dans ce bucket
            let keyExists = false;
            const bucket = hashMap[index];
            if (bucket.length > 0) {
                for (let item of bucket) {
                    if (item.key === key) {
                        item.value = content;
                        keyExists = true;
                        break;
                    }
                }
            }
            // Si la clé n'existe pas, l'ajouter
            if (!keyExists) {
                bucket.push({ key: key, value: content });
            }
            return true;
        }
        catch (e) {
            return false;
        }
    }
    remove(index, key, hashMap) {
        try {
            if (!hashMap[index] || hashMap[index].length === 0)
                return false;
            const bucket = hashMap[index];
            let keyRemoved = false;
            // Itérer à l'envers pour pouvoir splicer sans casser l'itération
            for (let i = bucket.length - 1; i >= 0; i--) {
                const item = bucket[i];
                if (item.key === key) {
                    bucket.splice(i, 1);
                    keyRemoved = true;
                }
            }
            return keyRemoved;
        }
        catch (e) {
            return false;
        }
    }
    get(index, key, hashMap) {
        if (!hashMap[index] || hashMap[index].length === 0)
            return null;
        const bucket = hashMap[index];
        for (const item of bucket) {
            if (item.key === key)
                return item.value;
        }
        return null;
    }
}
exports.BucketManager = BucketManager;
//# sourceMappingURL=bucketManager.js.map