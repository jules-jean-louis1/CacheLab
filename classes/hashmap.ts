import crypto from "crypto";

class HashMap {
  private bucket: any[] = [[], [], [], [], [], [], [], [], [], []];

  constructor() {}

  getBucket() {
    return this.bucket;
  }

  getHexFromKey(key: string, strategie: string): string {
    return crypto.createHash(strategie).update(key).digest("hex");
  }

  getSliceHash(hash: string): string {
    return hash.slice(0, 8);
  }

  getIndexFromHash(sliceHash: string, bucketSize: number): number {
    return parseInt(sliceHash, 16) % bucketSize;
  }

  getBucketLenght() {
    return this.bucket.length;
  }

  addToBucket(key: string, content: any) {
    const hash = this.getHexFromKey(key, "sha256");
    const slicehash = this.getSliceHash(hash);
    const index = this.getIndexFromHash(slicehash, this.getBucketLenght());
    try {
      if (Object.keys(this.bucket[index]).length) {
        this.bucket[index].forEach((item: any) => {
          for (let existingKey of Object.keys(item)) {
            if (existingKey === key) {
              delete item.key;
              this.bucket[index] = content;
              return { success: true, data: JSON.parse(content) };
            }
          }
        });
      } else {
        this.bucket[index].push(content);
        return { success: true, data: JSON.parse(content) };
      }
    } catch (e) {
      return { error: `Une erreur est survenue: ${e}` };
    }
  }

  removeToBucket(key: string) {
    const index = this.getIndex(key);
    try {
      this.bucket[index].forEach((item: any) => {
        for (let existingKey of Object.keys(item)) {
          if (existingKey === key) {
            delete item.key;
            return { success: item.key };
          }
        }
      });
    } catch (e) {
      return { error: `Une erreur est survenue: ${e}` };
    }
  }

  getIndex(key: string): number {
    const hash = this.getHexFromKey(key, "sha256");
    const slicehash = this.getSliceHash(hash);
    return this.getIndexFromHash(slicehash, this.getBucketLenght());
  }

  getValueFormKey(key: string) {
    const index = this.getIndex(key);
    for (let item of this.bucket[index]) {
      if (item.length) {
        return item;
      } else {
        return { result: "item not found" };
      }
    }
  }

  getAllData() {
    const result = [];
    for (let index = 0; index < this.bucket.length; index++) {
      const element = this.bucket[index];
      for (let [item, value] of Object.entries(element)) {
        result.push({ [item]: JSON.parse(value as string) });
      }
    }
    return result;
  }
}

export default HashMap;
