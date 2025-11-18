"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authGuard = authGuard;
const utils_1 = require("../utils/utils");
async function authGuard(request, reply) {
    const authHeader = request.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply.status(401).send({ error: "Token invalide" });
    }
    const token = authHeader.split(" ")[1];
    if (!(0, utils_1.verifyJWT)(token)) {
        return reply.status(401).send({ error: "Token invalide" });
    }
}
//# sourceMappingURL=authGuard.js.map