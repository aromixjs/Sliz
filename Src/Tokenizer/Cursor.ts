export class CharacterCursor {
  private Index = 0;

  constructor(
    readonly Source: string,
    Index = 0,
  ) {
    this.Index = Index;
  }

  /** Reset the cursor to the beginning. */
  Init(): void {
    this.Index = 0;
  }

  /** Character at the current position. */
  Peek(offset = 0): number {
    return this.Source.charCodeAt(this.Index + offset);
  }

  /** Advance by one character. */
  Advance(): void {
    this.Index++;
  }

  /** Current position. */
  get Position(): number {
    return this.Index;
  }

  /** Number of characters remaining. */
  get CharsLeft(): number {
    return this.Source.length - this.Index;
  }

  /** Create a cursor at the current position. */
  Clone(): CharacterCursor {
    return new CharacterCursor(this.Source, this.Index);
  }

  /** Number of characters between two cursors. */
  Diff(other: CharacterCursor): number {
    return this.Index - other.Index;
  }

  /** Source text between another cursor and this cursor. */
  GetChars(start: CharacterCursor): string {
    return this.Source.slice(start.Index, this.Index);
  }

  /** Whether the cursor reached the end. */
  get Eof(): boolean {
    return this.Index >= this.Source.length;
  }
}