import chars from "../scanner/chars";
import is from "../scanner/is";
import { CharacterCursor } from "./cursor";
import { Token } from "./token";
import { SkipStringResult } from "./utils";

export class Skip {
  protected cursor!: CharacterCursor;
  protected tokens!: Token[];

  protected skipBlockComment() {}
  protected skipLineComment() {}

  protected skipTemplateString() {}

  protected skipString(): SkipStringResult {
    const quote = this.cursor.peek();
    this.cursor.advance();
    while (!this.cursor.eof) {
      const code = this.cursor.peek();
      if (code === chars.backslash) {
        this.cursor.advance();
        this.cursor.advanceIf(!this.cursor.eof);
        continue;
      }
      if (code === quote) {
        this.cursor.advance();
        return SkipStringResult.Terminated;
      }
      if (code === chars.carriageReturn || code === chars.lineFeed) {
        return SkipStringResult.UnterminatedNewLine;
      }
      this.cursor.advance();
    }
    return SkipStringResult.UnterminatedEof;
  }

  protected skipJsExpression() {
    let depth = 1;
    while (!this.cursor.eof) {
      const code = this.cursor.peek();
      if (is.quote(code)) {
        const result = this.skipString();

        continue;
      }

      if (code === chars.backtick) {
      }

      if (is.lineCommentStart(this.cursor)) {
      }
      if (is.blockCommentStart(this.cursor)) {
      }
    }
  }

  protected skipWhiteSpace() {
    while (!this.cursor.eof) {
      const code = this.cursor.peek();
      if (!is.whitespace(code)) {
        break;
      }
      this.cursor.advance();
    }
  }
}
