export class CharacterCursor {
  private index = 0;
  readonly source: string;

  constructor(source: string, position: number) {
    this.source = source;
    this.index = Math.max(0, Math.min(position, source.length));
  }


  peek(): number {
    return this.source.charCodeAt(this.index);
  }

  peekAtOffset(offset: number): number {
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

  getChars(start: number): string {
    return this.source.slice(start, this.index);
  }


  get eof(): boolean {
    return this.index >= this.source.length;
  }
}
