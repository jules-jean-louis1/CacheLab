"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const hashmap_1 = __importDefault(require("./classes/hashmap"));
const server = (0, fastify_1.default)();
// Création d'une instance de HashMap qui sera disponible pour toute l'app
const hashMapInstance = new hashmap_1.default([[], [], [], [], [], [], [], [], [], []]);
server.get("/ping", async (request, reply) => {
    return "pong\n";
});
server.get("/bucket/length", async (request, reply) => {
    const length = hashMapInstance.getBucketLenght(hashMapInstance);
    return { bucketLength: length };
});
server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
//# sourceMappingURL=main.js.map