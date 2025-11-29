"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkipNode = void 0;
class SkipNode {
    key;
    value;
    right;
    down;
    left;
    up;
    constructor(key, value = []) {
        this.key = key;
        this.value = value;
        this.right = null;
        this.down = null;
        this.left = null;
        this.up = null;
    }
}
exports.SkipNode = SkipNode;
//# sourceMappingURL=skipNode.js.map