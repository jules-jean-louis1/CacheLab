import fastify from "fastify";
import HashMap from "./classes/hashmap";

const server = fastify();

// Création d'une instance de HashMap qui sera disponible pour toute l'app
const hashMapInstance = new HashMap();

server.get("/ping", async (request, reply) => {
  return "pong\n";
});

server.get("/bucket/length", async (request, reply) => {
  const length = hashMapInstance.getBucketLenght();
  return { bucketLength: length };
});

server.get("/key", async (request, reply) => {
  console.log(request.body);
});
server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
