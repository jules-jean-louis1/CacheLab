"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hashmapIterator_1 = __importDefault(require("./hashmapIterator"));
class HashMap {
    hashMap = [[], [], [], [], [], [], [], [], [], []];
    elementCount = 0;
    bucketCount = 10;
    _index;
    _bucketManager;
    _resizeManager;
    constructor(_index, _bucketManager, _resizeManager) {
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
    addToHashMap(key, content) {
        const index = this._index.getIndex(key, this.bucketCount);
        const success = this._bucketManager.add(this.hashMap, index, key, content);
        if (success) {
            this.elementCount++;
            this.checkAndResize();
        }
    }
    removeToHashMap(key) {
        const index = this._index.getIndex(key, this.bucketCount);
        const removed = this._bucketManager.remove(index, key, this.hashMap);
        if (removed) {
            this.elementCount--;
        }
        return removed;
    }
    getKey(key) {
        const index = this._index.getIndex(key, this.bucketCount);
        return this._bucketManager.get(index, key, this.hashMap);
    }
    getAllData() {
        const allData = [];
        const iterator = new hashmapIterator_1.default(this.hashMap);
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
            this.bucketCount *= 2;
        }
    }
    reHashing(currenthashMap, newhashMap) {
        const iterator = new hashmapIterator_1.default(currenthashMap);
        while (iterator.hasNext()) {
            const element = iterator.next();
            if (!element)
                return;
            // element is { key, value }
            const key = element.key;
            const value = element.value;
            // Use the new hash map size when recalculating indexes
            const getIndex = this._index.getIndex(key, newhashMap.length);
            newhashMap[getIndex].push({ key: key, value: value });
        }
        this.hashMap = newhashMap;
    }
}
exports.default = HashMap;
//# sourceMappingURL=hashmap.js.map