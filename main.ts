import fastify from "fastify";
import HashMap from "./classes/hashmap";

const server = fastify({ logger: true });

// Création d'une instance de HashMap qui sera disponible pour toute l'app
const hashMapInstance = new HashMap();

server.get("/ping", async (request, reply) => {
  return "pong\n";
});

server.get("/bucket/length", async (request, reply) => {
  const length = hashMapInstance.getBucketLenght();
  return { bucketLength: length };
});

server.get("/bucket", async (request, reply) => {
  const bucket = hashMapInstance.getBucket();
  return { bucket: bucket };
});

// curl -d '{"cart:user_128": {"item_id": 123}}' -H "Content-Type: application/json" -X POST http://localhost:8080/key
// curl -d '{"cart:user_128": [{ "id_produit": " chaussure_42", "quantite": 1, "prix": 89.99 }, { "id_produit": " chaussette_10", "quantite": 2, "prix": 5.00 }]}' -H "Content-Type: application/json" -X POST http://localhost:8080/key
server.post("/key", async (request, reply) => {
  for (const [key, value] of Object.entries(
    request.body as Record<string, any>
  )) {
    const index = hashMapInstance.addToBucket(key, {
      [key]: JSON.stringify(value),
    });
    // console.log(`Added key "${key}" to bucket index ${index}`);
  }
  console.log("Current bucket state:", hashMapInstance.getBucket());

  // return {
  //   message: "Keys added successfully",
  //   bucketState: hashMapInstance.getBucket(),
  // };
});

server.get<{
  Params: { key: string };
}>("/keys/:key", async (request, reply) => {
  const { key } = request.params;
  const keyFind = hashMapInstance.getValueFormKey(key);
  return {
    keyFind,
  };
});

server.get("/keys", async (request, reply) => {
  const dump = hashMapInstance.getAllData();
  return { dump };
});

server.put<{Params: {key: string}}>("/keys/:key",  async (request, reply) => {
  const { key } = request.params;
  let updateItem;
  for(let [itemKey, value] of Object.entries(request.body as Record<string, any>)) {
    updateItem = hashMapInstance.addToBucket(key, {[key]: JSON.stringify(value)})
  }
  return updateItem;
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
