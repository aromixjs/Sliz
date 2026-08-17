import { CharacterScanner } from "../common/scanner";
import { JsToken, JsTokenType } from "./token";

export class JsExprTokenizer extends CharacterScanner<JsToken> {
  public tokenize(start: number) {
    this.clearTokens();
    this.advanceTo(start);
    this.emit({ type: JsTokenType.ExpressionStart, start, end: start + 1 });
    this.advance();
    this.consumeExpressionBody();
    return this.outcome;
  }

  /*===== JsExpr local checks/getters =====*/
  private get outcome() {
    const tokens = this.getTokens();
    const last = tokens[tokens.length - 1];
    return { end: last.end, closed: last.type === JsTokenType.ExpressionEnd, tokens };
  }

  private get isRawJsBoundary(): boolean {
    return (
      this.isQuote ||
      this.isBacktick ||
      this.isOpenBrace ||
      this.isCloseBrace ||
      this.isJsLineCommentStart ||
      this.isJsBlockCommentStart ||
      this.isHtmlTagLike
    );
  }

  private get shouldStopScanning() {
    const tokens = this.getTokens();
    const last = tokens[tokens.length - 1];
    return last.type === JsTokenType.TagLike || last.type === JsTokenType.UnterminatedExpression;
  }

  /*===== Consumers =====*/
  private consumeExpressionBody() {
    const exprStart = this.position;
    while (!this.eof) {
      if (this.isQuote) {
        this.consumeStringLiteral();
        continue;
      }

      if (this.isBacktick) {
        this.consumeTemplateLiteral();
        continue;
      }

      if (this.isJsLineCommentStart) {
        this.consumeLineComment();
        continue;
      }

      if (this.isJsBlockCommentStart) {
        this.consumeBlockComment();
        continue;
      }
      //  IT Will Not Support Jsx like Syntax
      if (this.isHtmlTagLike) {
        this.emit({ type: JsTokenType.TagLike, start: this.position, end: this.position });
        return;
      }

      if (this.isOpenBrace) {
        this.advance();
        this.consumeExpressionBody();
        if (this.shouldStopScanning) {
          return;
        }
        continue;
      }

      if (this.isCloseBrace) {
        this.advance();
        this.emit({
          type: JsTokenType.ExpressionEnd,
          start: this.position - 1,
          end: this.position,
        });
        return;
      }

      this.consumeRawJs();
    }
    this.emit({ type: JsTokenType.UnterminatedExpression, start: exprStart, end: this.position });
  }

  private consumeRawJs() {
    const start = this.position;

    while (!this.eof && !this.isRawJsBoundary) {
      this.advance();
    }

    this.emitIf(this.position > start, {
      type: JsTokenType.RawJs,
      start,
      end: this.position,
      content: this.getChars(start),
    });
  }

  private consumeStringLiteral() {
    const start = this.position;
    const quote = this.peek();
    this.advance();

    while (!this.eof) {
      if (this.isEscape) {
        this.advance();
        this.advanceIf(!this.eof);
        continue;
      }

      if (this.peek() === quote) {
        this.advance();
        this.emit({
          type: JsTokenType.StringLiteral,
          start,
          end: this.position,
          content: this.getChars(start),
        });
        return;
      }
      // Single and double quoted strings cannot contain newlines.
      if (this.isLineBreak) {
        break;
      }

      this.advance();
    }

    this.emit({
      type: JsTokenType.UnterminatedString,
      start,
      end: this.position,
      content: this.getChars(start),
    });
  }

  private consumeTemplateLiteral() {
    const start = this.position;
    this.advance();

    while (!this.eof) {
      if (this.isEscape) {
        this.advance();
        this.advanceIf(!this.eof);
        continue;
      }

      if (this.isTemplateInterpolationStart) {
        this.advanceBy(2);
        this.consumeExpressionBody();

        if (this.shouldStopScanning) {
          return;
        }
        continue;
      }

      if (this.isBacktick) {
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

    this.emit({
      type: JsTokenType.UnterminatedTemplateLiteral,
      start,
      end: this.position,
      content: this.getChars(start),
    });
  }

  private consumeLineComment() {
    const start = this.position;
    this.advanceBy(2);
    while (!this.eof && !this.isLineBreak) {
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
      if (this.isBlockCommentEnd) {
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

    this.emit({
      type: JsTokenType.UnterminatedBlockComment,
      start,
      end: this.position,
      content: this.getChars(start),
    });
  }
}
