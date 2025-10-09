import { verifyJWT } from "../utils/utils";

export async function authGuard(request: any, reply: any) {
  const authHeader = request.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Token invalide" });
  }
  const token = authHeader.split(" ")[1];
  if (!verifyJWT(token)) {
    return reply.status(401).send({ error: "Token invalide" });
  }
}
