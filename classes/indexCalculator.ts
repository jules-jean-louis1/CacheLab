import { Hasher } from "./hasher";

export class IndexCalculator {
  private hasher: Hasher;
  
  constructor(hasher: Hasher) {
    this.hasher = hasher;
  }
  
  getIndex(key: string | number, bucketSize: number): number {
    const hash = this.hasher.hash(key);
    const slicedHash = this.hasher.slice(hash);
    return parseInt(slicedHash, 16) % bucketSize;
  }
}