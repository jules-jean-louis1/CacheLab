export class ResizeManager {
  shouldResize(elementCount: number, bucketCount: number): boolean {
    const loadFactor = elementCount / bucketCount;
    return loadFactor >= 0.75;
  }

  resize(bucketCount: number): any {
    const newhashMap: any[] = [];
    for (let index = 0; index < bucketCount * 2; index++) {
      newhashMap.push([]);
    }
    return newhashMap;
  }

  reHashing(currentBuckets: any): any {
    
  }
}
