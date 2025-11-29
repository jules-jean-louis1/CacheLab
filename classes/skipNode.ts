type NodeKey = number | string | null;
type NodeValue = string[] | null;

export class SkipNode {
  public key: NodeKey;
  public value: NodeValue;
  public right: SkipNode | null;
  public down: SkipNode | null;
  public left: SkipNode | null;
  public up: SkipNode | null;

  constructor(key: NodeKey, value: NodeValue = []) {
    this.key = key;
    this.value = value;
    this.right = null;
    this.down = null;
    this.left = null;
    this.up = null;
  }
}
