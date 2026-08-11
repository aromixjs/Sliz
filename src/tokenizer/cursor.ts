export class CharacterCursor {
  private index = 0;


  constructor(
    readonly source: string,
    index = 0,
  ) {
    this.index = Math.max(0, Math.min(index, source.length));
  }


  peek(offset = 0): number {
    return this.source.charCodeAt(this.index + offset);
  }

  advance(): void {
    this.index++;
  }


  advanceTo(position: number): void {
    this.index = Math.max(0, Math.min(position, this.source.length));
  }

  get position(): number {
    return this.index;
  }

  clone(): CharacterCursor {
    return new CharacterCursor(this.source, this.index);
  }


  getChars(start: CharacterCursor): string {
    return this.source.slice(start.index, this.index);
  }


  get eof(): boolean {
    return this.index >= this.source.length;
  }
}
