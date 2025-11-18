"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HashMapIterator {
    bucketIndex;
    elementIndex;
    hashMapData;
    constructor(hashMapData) {
        this.hashMapData = hashMapData;
        this.bucketIndex = 0;
        this.elementIndex = 0;
        this.findNextValidElement();
    }
    setHashMap(hashMapData) {
        this.hashMapData = hashMapData;
    }
    hasNext() {
        return this.bucketIndex < this.hashMapData.length;
    }
    // Renvoie l'élément suivant et avance le curseur
    next() {
        // On s'assure qu'on ne lit pas dans le vide
        if (!this.hasNext()) {
            return null;
        }
        // On récupère l'élément actuel
        const element = this.hashMapData[this.bucketIndex][this.elementIndex];
        this.elementIndex++;
        this.findNextValidElement();
        return element;
    }
    // Trouver la prochaine position valide
    findNextValidElement() {
        // On boucle tant qu'on est dans les limites du tableau principal
        while (this.bucketIndex < this.hashMapData.length) {
            const currentBucket = this.hashMapData[this.bucketIndex];
            // S'il y a bien un élément à notre position actuelle dans le tiroir, on a trouvé = On arrête tout.
            if (currentBucket && this.elementIndex < currentBucket.length) {
                return;
            }
            // Sinon, on passe au tiroir suivant et on réinitialise l'index de l'élément
            this.bucketIndex++;
            this.elementIndex = 0;
        }
    }
}
exports.default = HashMapIterator;
//# sourceMappingURL=hashmapIterator.js.map