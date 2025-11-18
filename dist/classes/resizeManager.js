"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResizeManager = void 0;
class ResizeManager {
    shouldResize(elementCount, bucketCount) {
        const loadFactor = elementCount / bucketCount;
        return loadFactor >= 0.75;
    }
    resize(bucketCount) {
        const newhashMap = [];
        for (let index = 0; index < bucketCount * 2; index++) {
            newhashMap.push([]);
        }
        return newhashMap;
    }
    reHashing(currentBuckets) {
    }
}
exports.ResizeManager = ResizeManager;
//# sourceMappingURL=resizeManager.js.map