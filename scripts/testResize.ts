import { Hasher } from "../classes/hasher";
import { IndexCalculator } from "../classes/indexCalculator";
import { BucketManager } from "../classes/bucketManager";
import { ResizeManager } from "../classes/resizeManager";
import { SkipList } from "../classes/skipList";
import HashMap from "../classes/hashmap";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error("Assertion failed:", message);
    process.exit(1);
  }
}

async function run() {
  const hasher = new Hasher();
  const indexCalculator = new IndexCalculator(hasher);
  const bucketManager = new BucketManager();
  const resizeManager = new ResizeManager();
  const skipList = new SkipList();
  const map = new HashMap(indexCalculator, bucketManager, resizeManager, skipList);

  // Insert enough items to trigger resize (initial bucketCount is 10 => resize at 8)
  const keys: string[] = [];
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
