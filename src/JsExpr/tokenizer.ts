import { CharacterScanner } from "../common/scanner";
import { JsToken, JsTokenType } from "./token";

export class JsExprTokenizer extends CharacterScanner<JsToken> {
  public tokenize() {
    const start = this.position;
    this.emit({ type: JsTokenType.ExpressionStart, start, end: start + 1 });
    this.advance();
    this.consumeExpressionBody(start);
    return this.readOutcome();
  }

  private readOutcome() {
    const tokens = this.getTokens();
    const last = tokens[tokens.length - 1];
    return { end: last.end, closed: last.type === JsTokenType.ExpressionEnd, tokens };
  }

  private consumeExpressionBody(exprStart: number) {
      let rawStart = this.position;
    while (!this.eof) {
      const code = this.peek();

      if (this.isQuote(code)) {
              this.flushRawJS(rawStart);
        this.consumeStringLiteral();
         rawStart = this.position;
        continue;
      }

      if (code === this.backtick) {
                      this.flushRawJS(rawStart);
        this.consumeTemplateLiteral();
          rawStart = this.position;
        continue;
      }

      if (this.isJsLineCommentStart) {
                      this.flushRawJS(rawStart);
        this.consumeLineComment();
          rawStart = this.position;
        continue;
      }

    if (this.isJsBlockCommentStart) {
      this.flushRawJS(rawStart);
      this.consumeBlockComment();
      rawStart = this.position;
      continue;
    }

      if (this.isHtmlTagLike) {
        this.flushRawJS(rawStart)
        const bailPosition = this.position;
        this.emit({ type: JsTokenType.TagLike, start: bailPosition, end: bailPosition });
        return;
      }

      if (code === this.openBrace) {
             this.flushRawJS(rawStart);
        const nestedStart = this.position;
        this.advance();
        this.consumeExpressionBody(nestedStart);
         rawStart = this.position;
        if (this.lastEmittedWasTerminal()) {
          return;
        }
        continue;
      }

      if (code === this.closeBrace) {
              this.flushRawJS(rawStart);
        this.advance();
        this.emit({
          type: JsTokenType.ExpressionEnd,
          start: this.position - 1,
          end: this.position,
        });
        return;
      }
      this.advance();
    }
 this.flushRawJS(rawStart);
    this.emit({ type: JsTokenType.UnterminatedExpression, start: exprStart, end: this.position });
  }


  private flushRawJS(start: number) {


    this.emitIf(this.position > start, {
      type: JsTokenType.RawJs,
      start,
      end: this.position,
      content: this.getChars(start),
    });





  }

  private lastEmittedWasTerminal(): boolean {
    const tokens = this.getTokens();
    const last = tokens[tokens.length - 1];
    return last.type === JsTokenType.TagLike || last.type === JsTokenType.UnterminatedExpression;
  }

  private consumeStringLiteral() {
    const start = this.position;
    const quote = this.peek();
    this.advance();

    while (!this.eof) {
      const code = this.peek();

      if (code === this.backslash) {
        this.advance();
        this.advanceIf(!this.eof);
        continue;
      }

      if (code === quote) {
        this.advance();
        this.emit({
          type: JsTokenType.StringLiteral,
          start,
          end: this.position,
          content: this.getChars(start),
        });
        return;
      }

      if (code === this.carriageReturn || code === this.lineFeed) {
        this.emit({ type: JsTokenType.UnterminatedString, start, end: this.position });
        return;
      }

      this.advance();
    }

    this.emit({ type: JsTokenType.UnterminatedString, start, end: this.position });
  }

  private consumeTemplateLiteral() {
    const start = this.position;
    this.advance();

    while (!this.eof) {
      const code = this.peek();

      if (code === this.backslash) {
        this.advance();
        this.advanceIf(!this.eof);
        continue;
      }

      if (code === this.dollar && this.peekAtOffset(1) === this.openBrace) {
        const interpolationStart = this.position;
        this.advanceBy(2);
        this.consumeExpressionBody(interpolationStart);

        if (this.lastEmittedWasTerminal()) {
          return;
        }
        continue;
      }

      if (code === this.backtick) {
        this.advance();
        this.emit({
          type: JsTokenType.TemplateLiteral,
          start,
          end: this.position,
          content: this.getChars(start),
        });
        return;
      }

      this.advance();
    }
    this.emit({ type: JsTokenType.UnterminatedTemplateLiteral, start, end: this.position });
  }

  private consumeLineComment() {
    const start = this.position;
    this.advanceBy(2);

    while (!this.eof && this.peek() !== this.carriageReturn && this.peek() !== this.lineFeed) {
      this.advance();
    }
    this.emit({
      type: JsTokenType.LineComment,
      start,
      end: this.position,
      content: this.getChars(start),
    });
  }

  private consumeBlockComment() {
    const start = this.position;
    this.advanceBy(2);

    while (!this.eof) {
      if (this.peek() === this.asterisk && this.peekAtOffset(1) === this.slash) {
        this.advanceBy(2);
        this.emit({
          type: JsTokenType.BlockComment,
          start,
          end: this.position,
          content: this.getChars(start),
        });
        return;
      }

      this.advance();
    }

    this.emit({ type: JsTokenType.UnterminatedBlockComment, start, end: this.position });
  }
}
