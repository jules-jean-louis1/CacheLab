import fastify from "fastify";
import HashMap from "./classes/hashmap";
import { Hasher } from "./classes/hasher";
import { IndexCalculator } from "./classes/indexCalculator";
import { BucketManager } from "./classes/bucketManager";
import { ResizeManager } from "./classes/resizeManager";

const server = fastify({ logger: true });

const hasher = new Hasher();
const indexCalculator = new IndexCalculator(hasher);
const bucketManager = new BucketManager();
const resizeManager = new ResizeManager();
const hashMapInstance = new HashMap(
  indexCalculator,
  bucketManager,
  resizeManager
);

server.get("/hashMap/length", async (request, reply) => {
  const length = hashMapInstance.gethashMapLenght();
  return { hashMapLength: length };
});

server.get("/hashMap", async (request, reply) => {
  const hashMap = hashMapInstance.gethashMap();
  return { hashMap: hashMap };
});

server.post("/key", async (request, reply) => {
  for (const [key, value] of Object.entries(
    request.body as Record<string, any>
  )) {
    hashMapInstance.addToHashMap(key, value);
  }
  return {
    message: "Keys added successfully",
    hashMapState: hashMapInstance.gethashMap(),
  };
});

server.get<{
  Params: { key: string };
}>("/keys/:key", async (request, reply) => {
  const { key } = request.params;
  const keyFind = hashMapInstance.getKey(key);
  return {
    keyFind,
  };
});

server.get("/keys", async (request, reply) => {
  const dump = hashMapInstance.getAllData();
  return { count: dump.length, dump };
});

server.put<{ Params: { key: string } }>(
  "/keys/:key",
  async (request, reply) => {
    const { key } = request.params;
    let updateItem;
    for (let [itemKey, value] of Object.entries(
      request.body as Record<string, any>
    )) {
      updateItem = hashMapInstance.addToHashMap(key, value);
    }
    return updateItem;
  }
);

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
