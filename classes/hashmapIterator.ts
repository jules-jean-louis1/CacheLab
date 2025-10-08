interface IIterator<T> {
    next(): T;
    hasNext(): boolean;
    setHashMap(hashMapData: any): any;
}

class HashMapIterator implements IIterator<{ key: string, value: any } | null> {
    private bucketIndex: number;
    private elementIndex: number;
    private hashMapData: any[][];

    constructor(hashMapData: any[][]) {
        this.hashMapData = hashMapData;
        this.bucketIndex = 0;
        this.elementIndex = 0;

        this.findNextValidElement();
    }

    public setHashMap(hashMapData: any[]): any {
        this.hashMapData = hashMapData
    }

    public hasNext(): boolean {
        return this.bucketIndex < this.hashMapData.length;
    }

    // Renvoie l'élément suivant et avance le curseur
    public next(): { key: string, value: any } | null {
        // On s'assure qu'on ne lit pas dans le vide
        if (!this.hasNext()) {
            return null; // Ou throw new Error("No more elements");
        }

        // On récupère l'élément actuel
        const element = this.hashMapData[this.bucketIndex][this.elementIndex];

        // IMPORTANT : On se prépare pour le *prochain* appel à next()
        this.elementIndex++; // On avance dans le tiroir actuel
        this.findNextValidElement(); // Et on cherche la prochaine position valide

        return element;
    }

    // Méthode privée pour trouver la prochaine position valide (le cœur de la logique)
    private findNextValidElement(): void {
        // On boucle tant qu'on est dans les limites du tableau principal
        while (this.bucketIndex < this.hashMapData.length) {
            const currentBucket = this.hashMapData[this.bucketIndex];
            // S'il y a bien un élément à notre position actuelle dans le tiroir, on a trouvé ! On arrête tout.
            if (currentBucket && this.elementIndex < currentBucket.length) {
                return;
            }

            // Sinon, on passe au tiroir suivant et on réinitialise l'index de l'élément
            this.bucketIndex++;
            this.elementIndex = 0;
        }
    }
}

export default HashMapIterator;