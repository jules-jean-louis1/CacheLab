import { BucketManager } from "./bucketManager";
import HashMapIterator from "./hashmapIterator";
import { IndexCalculator } from "./indexCalculator";
import { ResizeManager } from "./resizeManager";

class HashMap {
  private hashMap: any[] = [[], [], [], [], [], [], [], [], [], []];
  public elementCount: number = 0;
  public bucketCount: number = 10;
  private _index: IndexCalculator;
  private _bucketManager: BucketManager;
  private _resizeManager: ResizeManager;

  constructor(
    _index: IndexCalculator,
    _bucketManager: BucketManager,
    _resizeManager: ResizeManager
  ) {
    this._index = _index;
    this._bucketManager = _bucketManager;
    this._resizeManager = _resizeManager;
  }

  gethashMap() {
    return this.hashMap;
  }

  gethashMapLenght() {
    return this.bucketCount;
  }

  addToHashMap(key: string, content: any) {
    const index = this._index.getIndex(key, this.bucketCount);
    const success = this._bucketManager.add(this.hashMap, index, key, content);
    if (success) {
      this.elementCount++;
      this.checkAndResize();
    }
  }

  removeToHashMap(key: string): boolean {
    const index = this._index.getIndex(key, this.bucketCount);
    const removed = this._bucketManager.remove(index, key, this.hashMap);
    if (removed) {
      this.elementCount--;
    }
    return removed;
  }

  getKey(key: string) {
    const index = this._index.getIndex(key, this.bucketCount);
    return this._bucketManager.get(index, key, this.hashMap);
  }

  getAllData() {
    const allData: any[] = [];
    const iterator = new HashMapIterator(this.hashMap);

    while (iterator.hasNext()) {
      const element = iterator.next();
      if (element !== null) {
        allData.push(element);
      }
    }
    this.elementCount = allData.length;
    return allData;
  }

  getCountElment() {
    return this.elementCount;
  }

  checkAndResize() {
    if (this._resizeManager.shouldResize(this.elementCount, this.bucketCount)) {
      const newBuckets = this._resizeManager.resize(this.bucketCount);
      this.reHashing(this.hashMap, newBuckets);
      this.bucketCount = newBuckets.length;
    }
  }

  reHashing(currenthashMap: any[], newhashMap: any[]): any[] | void {
    const iterator = new HashMapIterator(currenthashMap);
    let moved = 0;
    while (iterator.hasNext()) {
      const element = iterator.next();
      // If iterator returns null for some reason, skip and continue
      if (!element) continue;
      const key = (element as any).key;
      const value = (element as any).value;

      const getIndex = this._index.getIndex(key, newhashMap.length);
      if (!newhashMap[getIndex]) newhashMap[getIndex] = [];
      newhashMap[getIndex].push({ key: key, value: value });
      moved++;
    }

    // Replace internal buckets with rehashed buckets
    this.hashMap = newhashMap;
    // Recompute elementCount from moved items to ensure consistency
    this.elementCount = moved;
  }
}

export default HashMap;
