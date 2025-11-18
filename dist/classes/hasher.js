"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hasher = void 0;
const crypto_1 = __importDefault(require("crypto"));
const types_1 = require("../types/types");
class Hasher {
    constructor() { }
    hash(key) {
        return crypto_1.default.createHash(types_1.StrategyHash.SHA256).update(key).digest("hex");
    }
    slice(hash) {
        return hash.slice(0, 8);
    }
}
exports.Hasher = Hasher;
//# sourceMappingURL=hasher.js.map