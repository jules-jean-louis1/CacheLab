import crypto from "crypto";
import { StrategyHash } from "../types/types";

export class Hasher {
  constructor() {}

  hash(key: string): string {
    return crypto.createHash(StrategyHash.SHA256).update(key).digest("hex");
  }

  slice(hash: string): string {
    return hash.slice(0, 8);
  }
}
