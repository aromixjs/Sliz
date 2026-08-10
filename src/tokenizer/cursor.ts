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
 * 5. `eof` returns `true` when the index has reached or passed the end of the source.
 */
export class CharacterCursor {
  private index = 0;

  /**
   * Initializes the cursor with source text and an optional start position.
   * The start position is clamped to `[0, source.length]` to prevent invalid state.
   */
  constructor(
    readonly source: string,
    index = 0,
  ) {
    this.index = Math.max(0, Math.min(index, source.length));
  }

  /**
   * Inspects the character code at the current position plus an optional offset.
   *
   * Returns `NaN` when the target position is outside valid bounds (past EOF).
   * Since `NaN` is never equal to any character code, all comparisons naturally
   * evaluate to `false`, which means loops and conditionals terminate correctly
   * without needing explicit bounds checks.
   *
   * @param offset Distance ahead of the current position to peek (default `0`).
   */
  peek(offset = 0): number {
    return this.source.charCodeAt(this.index + offset);
  }

  /**
   * Advances the cursor by one character. Does nothing if already at EOF.
   */
  advance(): void {
    this.index++;
  }

  /**
   * Advances the cursor to an absolute position.
   * The position is clamped to `[0, source.length]`.
   */
  advanceTo(position: number): void {
    this.index = Math.max(0, Math.min(position, this.source.length));
  }

  /**
   * The current read position as a zero-based index into the source string.
   */
  get position(): number {
    return this.index;
  }

  /**
   * Creates a copy of this cursor at the same position.
   * Useful for saving a checkpoint before speculative scanning.
   */
  clone(): CharacterCursor {
    return new CharacterCursor(this.source, this.index);
  }

  /**
   * Returns the source substring between the given cursor's position and this cursor's position.
   *
   * @param start The cursor marking the beginning of the range.
   */
  getChars(start: CharacterCursor): string {
    return this.source.slice(start.index, this.index);
  }

  /**
   * `true` when the cursor has reached or passed the end of the source string.
   */
  get eof(): boolean {
    return this.index >= this.source.length;
  }
}
