export class CharacterCursor {
  private index = 0;

  constructor(
    readonly source: string,
    index = 0,
  ) {
    this.index = index;
  }

  /** Reset the cursor to the beginning. */
  init(): void {
    this.index = 0;
  }

  /** Character at the current position. */
  peek(offset = 0): number {
    return this.source.charCodeAt(this.index + offset);
  }

  /** Advance by one character. */
  advance(): void {
    this.index++;
  }

  /** Current position. */
  get position(): number {
    return this.index;
  }

  /** Number of characters remaining. */
  get charsLeft(): number {
    return this.source.length - this.index;
  }

  /** Create a cursor at the current position. */
  clone(): CharacterCursor {
    return new CharacterCursor(this.source, this.index);
  }

  /** Number of characters between two cursors. */
  diff(other: CharacterCursor): number {
    return this.index - other.index;
  }

  /** Source text between another cursor and this cursor. */
  getChars(start: CharacterCursor): string {
    return this.source.slice(start.index, this.index);
  }

  /** Whether the cursor reached the end. */
  get eof(): boolean {
    return this.index >= this.source.length;
  }
}