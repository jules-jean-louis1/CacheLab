"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJWT = getJWT;
exports.verifyJWT = verifyJWT;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function getJWT() {
    return jsonwebtoken_1.default.sign({ exp: Math.floor(Date.now() / 100) + 60 * 60, data: "auth_cachelab" }, process.env.JWT_SECRET_KEY ?? "privateKey");
}
function verifyJWT(token) {
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY ?? "privateKey");
    return decoded ? true : false;
}
//# sourceMappingURL=utils.js.map