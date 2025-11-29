"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hasher_1 = require("../classes/hasher");
const indexCalculator_1 = require("../classes/indexCalculator");
const bucketManager_1 = require("../classes/bucketManager");
const resizeManager_1 = require("../classes/resizeManager");
const skipList_1 = require("../classes/skipList");
const hashmap_1 = __importDefault(require("../classes/hashmap"));
function assert(condition, message) {
    if (!condition) {
        console.error("Assertion failed:", message);
        process.exit(1);
    }
}
async function run() {
    const hasher = new hasher_1.Hasher();
    const indexCalculator = new indexCalculator_1.IndexCalculator(hasher);
    const bucketManager = new bucketManager_1.BucketManager();
    const resizeManager = new resizeManager_1.ResizeManager();
    const skipList = new skipList_1.SkipList();
    const map = new hashmap_1.default(indexCalculator, bucketManager, resizeManager, skipList);
    // Insert enough items to trigger resize (initial bucketCount is 10 => resize at 8)
    const keys = [];
    for (let i = 0; i < 9; i++) {
        const k = `test_key_${i}`;
        keys.push(k);
        map.addToHashMap(k, `value_${i}`);
    }
    const newBucketCount = map.gethashMapLenght();
    console.log("Bucket count after inserts:", newBucketCount);
    assert(newBucketCount >= 20, `Expected bucket count to be >= 20 after resize, got ${newBucketCount}`);
    // Verify all keys are still accessible and values match
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const v = map.getKey(k);
        assert(v !== null, `Key ${k} not found after rehash`);
        assert(v === `value_${i}`, `Key ${k} has unexpected value ${v}`);
    }
    console.log("Resize test passed — all keys present and correct.");
}
run().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=testResize.js.map