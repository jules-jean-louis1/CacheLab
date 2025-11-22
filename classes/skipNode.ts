export class SkipNode {
  public key: number | null;
  public value: string[] | null;
  public right: SkipNode | null;
  public down: SkipNode | null;
  public left: SkipNode | null;
  public up: SkipNode | null;

  constructor(key: number, value: string[] = []) {
    this.key = key;
    this.value = value;
    this.right = null;
    this.down = null;
    this.left = null;
    this.up = null;
  }
}
