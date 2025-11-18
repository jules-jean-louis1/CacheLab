"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexCalculator = void 0;
class IndexCalculator {
    hasher;
    constructor(hasher) {
        this.hasher = hasher;
    }
    getIndex(key, bucketSize) {
        const hash = this.hasher.hash(key);
        const slicedHash = this.hasher.slice(hash);
        return parseInt(slicedHash, 16) % bucketSize;
    }
}
exports.IndexCalculator = IndexCalculator;
//# sourceMappingURL=indexCalculator.js.map