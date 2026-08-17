import { CharacterScanner } from "../common/scanner";
import { TagEndToken, Token, TokenType } from "./token";

export class Tokenizer extends CharacterScanner<Token> {
  tokenize() {
    while (!this.eof) {
      /*=== Consume Html Comment ===*/
      if (this.isHtmlCommentStart) {
        this.consumeHtmlCommentStart();
        this.consumeHtmlCommentContent();
        this.consumeHtmlCommentEnd();
        continue;
      }

      const isDoctype = this.isHtmlTagLike && this.isHtmlDoctypeStart;
      if (isDoctype) {
        this.consumeDoctypeStart();
        this.consumeTagAttributes();
        this.emitIf(!this.eof && this.peek() === this.greaterThan, this.makeTagEndToken());
        continue;
      }

      this.advance();
    }

    return this.getTokens();
  }

  /*===== Html Comment Consumers =====*/
  private consumeHtmlCommentStart() {
    const start = this.position;
    this.advanceBy(4);
    this.emit({ type: TokenType.HtmlCommentStart, start, end: this.position });
  }
  private consumeHtmlCommentEnd() {
    const start = this.position;
    this.advanceBy(3);
    this.emit({ type: TokenType.HtmlCommentEnd, start, end: this.position });
  }
  private consumeHtmlCommentContent() {
    const start = this.position;

    while (!this.eof && !this.isHtmlCommentEnd) {
      // Error :: Parser will resolve that.
      if (this.isHtmlCommentStart) {
        this.emit({ type: TokenType.HtmlCommentStart, start: this.position, end: this.position });
        this.advanceBy(4);
        continue;
      }

      this.advance();
    }

    this.emitIf(this.position > start, {
      type: TokenType.HtmlCommentContent,
      start,
      end: this.position,
      content: this.getChars(start),
    });

    this.emitIf(this.eof, {
      type: TokenType.UnterminatedHtmlComment,
      start,
      end: this.position,
    });
  }
  /*===== Html Tag Consumers =====*/
  private makeTagEndToken(): TagEndToken {
    const start = this.position;
    this.advance();
    return { type: TokenType.TagEnd, start, end: this.position };
  }

  /*===== Html Doctype Consumer =====*/
  private consumeDoctypeStart() {
    const start = this.position;
    this.advanceBy(9);
    this.emit({ type: TokenType.DoctypeStart, start, end: this.position });
  }

  /*===== Html Attribute Consumers =====*/
  private consumeTagAttributes() {
    while (!this.eof) {
      this.skipWhiteSpace();
      if (this.eof || this.isHtmlTagEnd) {
        break;
      }
      const beforeAttribute = this.position;
      this.consumeAttributeName();
      this.skipWhiteSpace();
      const hasValue = !this.eof && this.peek() === this.equals;
      if (hasValue) {
        this.consumeEqual();
        this.skipWhiteSpace();
        this.consumeAttributeValue();
      }
      this.advanceIf(this.position === beforeAttribute);
    }
  }

  private consumeAttributeName() {
    const start = this.position;

    while (!this.eof) {
      const code = this.peek();
      if (!this.isHtmlAttributeNameChar(code)) {
        break;
      }
      this.advance();
    }

    this.emitIf(this.position > start, {
      type: TokenType.AttributeName,
      start,
      end: this.position,
      content: this.getChars(start),
    });
  }

  private consumeEqual() {
    const start = this.position;
    this.advance();
    this.emit({ type: TokenType.Equals, start, end: this.position });
  }

  private consumeAttributeValue() {
    const code = this.peek();
    const isExpression = code === this.openBrace;
    const isQuoted = !isExpression && this.isQuote(code);
    const isUnquoted = !isExpression && !isQuoted;
    if (isExpression) {
      this.consumeJsExpression();
    }

    if (isQuoted) {
      this.consumeQuotedAttributeValue();
    }
    if (isUnquoted) {
      this.consumeUnquotedAttributeValue();
    }
  }

  private consumeQuotedAttributeValue() {
    const start = this.position;
    const quote = this.peek();
    this.advance();
    while (!this.eof && this.peek() !== quote) {
      this.advance();
    }

    const closed = !this.eof;
    this.advanceIf(closed);
    this.emit({
      type: TokenType.QuotedAttributeValue,
      start,
      end: this.position,
      content: this.getChars(start),
    });
    this.emitIf(!closed, {
      type: TokenType.UnterminatedQuotedAttributeValue,
      start,
      end: this.position,
    });
  }

  private consumeUnquotedAttributeValue() {
    const start = this.position;

    while (!this.eof && !this.isWhitespace && !this.isHtmlTagEnd) {
      this.advance();
    }
    this.emitIf(this.position > start, {
      type: TokenType.UnQuotedAttributeValue,
      start,
      end: this.position,
      content: this.getChars(start),
    });
  }

  /*===== JavaScript Expression Consumer =====*/
  private consumeJsExpression() {}
}
