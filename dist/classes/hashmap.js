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
    _skipList;
    constructor(_index, _bucketManager, _resizeManager, _skipList) {
        this._index = _index;
        this._bucketManager = _bucketManager;
        this._resizeManager = _resizeManager;
        this._skipList = _skipList;
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
        this._skipList.insert(key, content);
        if (success) {
            this.elementCount++;
            this.checkAndResize();
        }
    }
    removeToHashMap(key) {
        const index = this._index.getIndex(key, this.bucketCount);
        const removed = this._bucketManager.remove(index, key, this.hashMap);
        this._skipList.remove(key);
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
            this.bucketCount = newBuckets.length;
        }
    }
    reHashing(currenthashMap, newhashMap) {
        const iterator = new hashmapIterator_1.default(currenthashMap);
        let moved = 0;
        while (iterator.hasNext()) {
            const element = iterator.next();
            // If iterator returns null for some reason, skip and continue
            if (!element)
                continue;
            const key = element.key;
            const value = element.value;
            const getIndex = this._index.getIndex(key, newhashMap.length);
            if (!newhashMap[getIndex])
                newhashMap[getIndex] = [];
            newhashMap[getIndex].push({ key: key, value: value });
            moved++;
        }
        // Replace internal buckets with rehashed buckets
        this.hashMap = newhashMap;
        // Recompute elementCount from moved items to ensure consistency
        this.elementCount = moved;
    }
}
exports.default = HashMap;
//# sourceMappingURL=hashmap.js.map