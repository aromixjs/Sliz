export class CharacterCursor {
  private index = 0;

  constructor(
    readonly source: string,
    index = 0,
  ) {
    this.index = index;
  }

  reset(): void {
    this.index = 0;
  }

  peek(offset = 0): number {
    return this.source.charCodeAt(this.index + offset);
  }

  advance(): void {
    this.index++;
  }

  advanceToEnd(): void {
    this.index = this.source.length;
  }

  advanceTo(position: number): void {
    this.index = position;
  }

  get position(): number {
    return this.index;
  }

  get charsLeft(): number {
    return this.source.length - this.index;
  }

  clone(): CharacterCursor {
    return new CharacterCursor(this.source, this.index);
  }

  diff(other: CharacterCursor): number {
    return this.index - other.index;
  }

  getChars(start: CharacterCursor): string {
    return this.source.slice(start.index, this.index);
  }

  get eof(): boolean {
    return this.index >= this.source.length;
  }
}
