"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hashmap_1 = __importDefault(require("../classes/hashmap"));
const hasher_1 = require("../classes/hasher");
const indexCalculator_1 = require("../classes/indexCalculator");
const bucketManager_1 = require("../classes/bucketManager");
const resizeManager_1 = require("../classes/resizeManager");
async function runDemo() {
    const hasher = new hasher_1.Hasher();
    const indexCalculator = new indexCalculator_1.IndexCalculator(hasher);
    const bucketManager = new bucketManager_1.BucketManager();
    const resizeManager = new resizeManager_1.ResizeManager();
    const map = new hashmap_1.default(indexCalculator, bucketManager, resizeManager);
    console.log("Initial bucket count:", map.gethashMapLenght());
    // Basic add / get / update / remove
    console.log('\n-- Basic operations --');
    map.addToHashMap("alpha", 1);
    map.addToHashMap("beta", 2);
    console.log("get alpha =>", map.getKey("alpha"));
    console.log("get beta  =>", map.getKey("beta"));
    // Snapshot after initial adds
    console.log('\n-- Snapshot after initial adds --');
    console.log(map.gethashMap());
    // Update
    map.addToHashMap("alpha", 42);
    console.log("after update alpha =>", map.getKey("alpha"));
    // Remove
    console.log("remove alpha =>", map.removeToHashMap("alpha"));
    console.log("get alpha after remove =>", map.getKey("alpha"));
    // Trigger rehashing by adding several keys (initial bucket count is 10, loadFactor 0.75 -> resize at 8)
    console.log('\n-- Trigger rehashing --');
    for (let i = 0; i < 9; i++) {
        map.addToHashMap(`k${i}`, `v${i}`);
    }
    console.log("bucket count after inserts:", map.gethashMapLenght());
    console.log("element count:", map.getCountElment());
    // Show collisions by printing indexes of a few keys
    console.log('\n-- Indexes for sample keys (to observe collisions) --');
    const keys = ["k0", "k1", "k2", "k3", "k4", "k5", "k6", "k7", "k8", "alpha", "beta"];
    for (const key of keys) {
        const idx = indexCalculator.getIndex(key, map.gethashMapLenght());
        console.log(`${key} -> index ${idx}`);
    }
    // Dump a bit of the hashmap
    console.log('\n-- Snapshot of internal buckets (non-empty only) --');
    const internal = map.gethashMap();
    internal.forEach((bucket, i) => {
        if (bucket && bucket.length > 0)
            console.log(i, bucket);
    });
}
runDemo().catch((err) => {
    console.error("Demo error:", err);
    process.exit(1);
});
//# sourceMappingURL=demoHashMap.js.map