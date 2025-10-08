import HashMapIterator from "./hashmapIterator";

export class BucketManager {
  constructor() {}
  add(hashMap: any, index: number, key: string, content: any): boolean {
    try {
      // Vérifier si la clé existe déjà dans ce bucket
      let keyExists = false;
      if (hashMap[index].length > 0) {
        for (let item of hashMap[index]) {
          for (let existingKey of Object.keys(item)) {
            if (existingKey === key) {
              // Remplacer la valeur existante
              item[existingKey] = content;
              keyExists = true;
              console.log("Key updated:", key);
              break;
            }
          }
          if (keyExists) break;
        }
      }

      // Si la clé n'existe pas, l'ajouter
      if (!keyExists) {
        hashMap[index].push({ [key]: content });
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  remove(index: number, key: string, hashMap: any): boolean {
    try {
      let keyRemoved = false;
      hashMap[index].forEach((item: any) => {
        for (let existingKey of Object.keys(item)) {
          if (existingKey === key) {
            delete item[existingKey];
            keyRemoved = true;
          }
        }
      });
      return keyRemoved;
    } catch (e) {
      return false;
    }
  }

  get(index: number, key: string, hashMap: any): any {
    const iterator = new HashMapIterator(hashMap);
    while (iterator.hasNext()) {
      const element = iterator.next();
      if (!element) return;
      for (let eK of Object.keys(element)) {
        if (eK === key) {
          return element;
        }
        return false;
      }
    }
  }
}
