import { CharacterScanner } from "../common/CharacterScanner";
import { JsInterpolationResolver, JsInterpolationStatus } from "../common/JsInterpolationResolver";
import { Token, TokenType } from "./token";

export class SlizTokenizer extends CharacterScanner<Token> {
  private readonly jsResolver: JsInterpolationResolver;

  constructor(source: string) {
    super(source);
    this.jsResolver = new JsInterpolationResolver(source);
  }

  /*===== Html Predicates =====*/
  private get isHtmlCommentStart(): boolean {
    return (
      this.peek() === this.lessThan &&
      this.peekAtOffset(1) === this.exclamationMark &&
      this.peekAtOffset(2) === this.minus &&
      this.peekAtOffset(3) === this.minus
    );
  }

  private get isHtmlCommentEnd(): boolean {
    return (
      this.peek() === this.minus &&
      this.peekAtOffset(1) === this.minus &&
      this.peekAtOffset(2) === this.greaterThan
    );
  }

  private get isHtmlDoctypeStart(): boolean {
    return this.source.slice(this.position, this.position + 9).toLowerCase() === "<!doctype";
  }

  protected get isHtmlClosingTagStart(): boolean {
    return (
      this.peek() === this.lessThan &&
      this.peekAtOffset(1) === this.slash &&
      this.isAlpha(this.peekAtOffset(2))
    );
  }

  private get isHtmlOpeningTagStart(): boolean {
    return this.peek() === this.lessThan && this.isAlpha(this.peekAtOffset(1));
  }

  private isHtmlTagNameChar(code: number): boolean {
    return this.isAlpha(code) || (code >= this.zero && code <= this.nine) || code === this.minus;
  }

  private get isHtmlTagEnd(): boolean {
    return (
      this.peek() === this.greaterThan ||
      (this.peek() === this.slash && this.peekAtOffset(1) === this.greaterThan)
    );
  }

  private isHtmlAttributeNameChar(code: number): boolean {
    return (
      !Number.isNaN(code) &&
      code !== this.space &&
      code !== this.tab &&
      code !== this.lineFeed &&
      code !== this.carriageReturn &&
      code !== this.equals &&
      code !== this.greaterThan &&
      code !== this.slash &&
      code !== this.doubleQuote &&
      code !== this.singleQuote
    );
  }

  /*====  The Main Tokenize Loop Runner  ==== */
  tokenize() {
    while (!this.eof) {
      /*=== Consume Html Comment ===*/
      if (this.isHtmlCommentStart) {
        this.consumeHtmlCommentStart();
        this.consumeHtmlCommentContent();
        this.consumeHtmlCommentEnd();
        continue;
      }
      /*=== Consume Doctype Tag ===*/
      if (this.isHtmlDoctypeStart) {
        this.consumeDoctypeStart();
        this.consumeTagAttributes();
        this.consumeTagEndIfPresent();
        continue;
      }

      /*=== Consume Opening/Closing Tag ===*/
      if (this.isHtmlClosingTagStart || this.isHtmlOpeningTagStart) {
        this.consumeTagStart();
        this.consumeTagAttributes();
        this.consumeTagEndIfPresent();
        continue;
      }

      /*=== Everything else is plain text content ===*/
      this.consumeText();
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
  private consumeTagStart() {
    this.advance();
    this.advanceIf(!this.eof && this.peek() === this.slash);
    const tagNameStart = this.position;
    while (!this.eof && this.isHtmlTagNameChar(this.peek())) {
      this.advance();
    }
    this.emit({
      type: TokenType.TagStart,
      start: tagNameStart,
      end: this.position,
      content: this.getChars(tagNameStart),
    });
  }

  private consumeTagEndIfPresent() {
    if (this.eof || !this.isHtmlTagEnd) {
      return;
    }

    const start = this.position;
    const isSelfClosing = this.peek() === this.slash && this.peekAtOffset(1) === this.greaterThan;

    if (isSelfClosing) {
      this.advanceBy(2);
    } else {
      this.advance();
    }

    this.emit({ type: TokenType.TagEnd, start, end: this.position });
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
    const isQuoted = !isExpression && this.isQuote;
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

  private consumeJsExpression() {
    const start = this.position;
    const outcome = this.jsResolver.resolve(start);
    this.advanceTo(outcome.end);
    if (outcome.status === JsInterpolationStatus.Closed) {
      this.emit({
        type: TokenType.JsExpression,
        start,
        end: outcome.end,
        content: outcome.text,
      });
      return;
    }

    if (outcome.status === JsInterpolationStatus.UnterminatedLiteral) {
      this.emit({ type: TokenType.UnterminatedJsLiteral, start, end: outcome.end });
      return;
    }
    this.emit({ type: TokenType.UnterminatedJsExpression, start, end: outcome.end });
  }

  /*===== Text Consumer =====*/
  private consumeText() {
    const start = this.position;
    while (
      !this.eof &&
      !this.isHtmlCommentStart &&
      !this.isHtmlDoctypeStart &&
      this.isHtmlClosingTagStart &&
      this.isHtmlOpeningTagStart
    ) {
      this.advance();
    }
    this.emitIf(this.position > start, {
      type: TokenType.Text,
      start,
      end: this.position,
      content: this.getChars(start),
    });
  }
}
