export class CharacterCursor {
  private index = 0;
  readonly source: string;

  constructor(source: string) {
    this.source = source;
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
  advanceIf(condition: boolean) {
    if (condition) {
      this.index++;
    }
  }

  advanceBy(offset: number): void {
    this.index = Math.max(0, Math.min(this.index + offset, this.source.length));
  }
  advanceTo(position: number) {
    this.index = position;
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
