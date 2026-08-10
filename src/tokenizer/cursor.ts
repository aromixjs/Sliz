/**
 * ## CharacterCursor
 *
 * A read-only cursor that tracks position within source text during tokenization.
 * Rather than creating substring copies, this class maintains a single integer
 * index into the original source string, avoiding repeated memory allocation.
 *
 * **How it works:**
 * 1. Receives the full source string once at construction.
 * 2. Maintains an internal numeric index representing the current read position.
 * 3. `peek()` inspects characters at or ahead of the current index without advancing.
 * 4. `advance()` increments the index by one to consume a character.
 * 5. All boundary checks return safe sentinel values (-1) instead of NaN or throwing,
 *    allowing tokenizer loops to terminate cleanly on EOF.
 */
export class CharacterCursor {
  private index = 0;


  /**
   * Initializes the cursor with source text and an optional start position.
   * The start position is clamped to [0, source.length] to prevent invalid state.
   */
  constructor(
    readonly source: string,
    index = 0,
  ) {
    this.index = Math.max(0, Math.min(index, source.length));
  }



    /**
   * Inspects a character code at the current position plus an optional offset.
   *
   * **How it works:**
   * 1. Computes target position as index + offset.
   * 2. Returns -1 if the target is outside valid bounds.
   * 3. Otherwise returns the char code at that position.
   *
   * The -1 sentinel allows callers to distinguish EOF from any valid character
   * code (which are always >= 0). This prevents silent failures where NaN
   * comparisons evaluate to false and skip intended branching logic.
   */
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
