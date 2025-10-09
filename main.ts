import fastify from "fastify";
import HashMap from "./classes/hashmap";
import { Hasher } from "./classes/hasher";
import { IndexCalculator } from "./classes/indexCalculator";
import { BucketManager } from "./classes/bucketManager";
import { ResizeManager } from "./classes/resizeManager";
import { getJWT } from "./utils/utils";
import { authGuard } from "./guard/authGuard";

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

server.post("/auth/login", async (request, reply) => {
  const token = getJWT();
  return token.length
    ? reply.status(200).send({ success: true, token: token })
    : reply.status(404).send({ error: "No token generated." });
});

server.get(
  "/hashMap/length",
  { preHandler: authGuard },
  async (request, reply) => {
    const length = hashMapInstance.gethashMapLenght();
    return { hashMapLength: length };
  }
);

server.get("/hashMap", { preHandler: authGuard }, async (request, reply) => {
  const hashMap = hashMapInstance.gethashMap();
  return { hashMap: hashMap };
});

server.post("/key", { preHandler: authGuard }, async (request, reply) => {
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
}>("/keys/:key", { preHandler: authGuard }, async (request, reply) => {
  const { key } = request.params;
  const keyFind = hashMapInstance.getKey(key);
  return {
    keyFind,
  };
});

server.get("/keys", { preHandler: authGuard }, async (request, reply) => {
  const dump = hashMapInstance.getAllData();
  return { count: dump.length, dump };
});

server.put<{ Params: { key: string } }>(
  "/keys/:key",
  { preHandler: authGuard },
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

server.delete<{ Params: { key: string } }>(
  "/keys/:key",
  { preHandler: authGuard },
  async (request, reply) => {
    const { key } = request.params;
    const deleted = hashMapInstance.removeToHashMap(key);
    return deleted
      ? { message: "Key deleted successfully", key }
      : reply.status(404).send({ error: "Key not found" });
  }
);

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
