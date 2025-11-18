import HashMap from "../classes/hashmap";
import { Hasher } from "../classes/hasher";
import { IndexCalculator } from "../classes/indexCalculator";
import { BucketManager } from "../classes/bucketManager";
import { ResizeManager } from "../classes/resizeManager";

async function runDemo() {
  const hasher = new Hasher();
  const indexCalculator = new IndexCalculator(hasher);
  const bucketManager = new BucketManager();
  const resizeManager = new ResizeManager();
  const map = new HashMap(indexCalculator, bucketManager, resizeManager);

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
  internal.forEach((bucket: any[], i: number) => {
    if (bucket && bucket.length > 0) console.log(i, bucket);
  });
}

runDemo().catch((err) => {
  console.error("Demo error:", err);
  process.exit(1);
});
