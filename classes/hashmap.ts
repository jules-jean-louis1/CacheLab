import crypto from "crypto";

class HashMap {
  private bucket: any[] = [[], [], [], [], [], [], [], [], [], []];

  constructor() { 
  }

  getHexFromKey(key: string, strategie: string): string {
    return crypto.createHash(strategie).update(key).digest("hex");
  }

  getSliceHash(hash: string): string {
    return hash.slice(0, 8);
  }

  getIndexFromHash(sliceHash: string, bucketSize: number): number {
    return parseInt(sliceHash) % bucketSize;
  }

  getBucketLenght() {
    return this.bucket.length;
  }
  addToBucket() {}

  removeToBucket() {}

  getValueFormKey() {}
}

export default HashMap;
