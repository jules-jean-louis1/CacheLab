"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
class HashMap {
    bucket = [[], [], [], [], [], [], [], [], [], []];
    constructor(bucket) {
        this.bucket = bucket;
    }
    getHexFromKey(key, strategie) {
        return crypto_1.default.createHash(strategie).update(key).digest("hex");
    }
    getSliceHash(hash) {
        return hash.slice(0, 8);
    }
    getIndexFromHash(sliceHash, bucketSize) {
        return parseInt(sliceHash) % bucketSize;
    }
    getBucketLenght(bucket) {
        return this.bucket.length;
    }
    addToBucket() { }
    removeToBucket() { }
    getValueFormKey() { }
}
exports.default = HashMap;
//# sourceMappingURL=hashmap.js.map