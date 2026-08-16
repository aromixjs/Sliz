import chars from "../scanner/chars";
import is from "../scanner/is";
import { CharacterCursor } from "./cursor";
import { Skip } from "./skip";
import { Token, TokenType } from "./token";
import * as acorn from "acorn";

export class Tokenizer extends Skip {
  protected cursor: CharacterCursor;
  protected tokens: Token[] = [];

  constructor(source: string) {
    super();
    this.cursor = new CharacterCursor(source);
  }

  tokenize() {
    while (!this.cursor.eof) {
      if (is.htmlCommentStart(this.cursor)) {
        this.consumeHtmlCommentStart();
        this.consumeHtmlCommentContent();
        this.consumeHtmlCommentEnd();
        continue;
      } else if (is.tagLike(this.cursor)) {
        if (is.doctypeStart(this.cursor)) {
          this.consumeDoctypeStart();
          this.skipWhiteSpace();
          this.consumeAttributeName();
          this.skipWhiteSpace();
          this.consumeEqual();
          this.skipWhiteSpace();
          this.consumeAttributeValue();
          continue;
        } else if (is.closingTagStart(this.cursor)) {
        } else {
        }
      }

      this.cursor.advance();
    }

    return this.tokens;
  }
  /*===== Common Consumers =====*/

  /*===== Html Comment Consumers =====*/
  private consumeHtmlCommentStart() {
    const start = this.cursor.position;
    this.cursor.advanceBy(4);
    this.tokens.push({
      type: TokenType.HtmlCommentStart,
      start,
      end: this.cursor.position,
    });
  }
  private consumeHtmlCommentEnd() {
    const start = this.cursor.position;
    this.cursor.advanceBy(3);
    this.tokens.push({
      type: TokenType.HtmlCommentEnd,
      start,
      end: this.cursor.position,
    });
  }
  private consumeHtmlCommentContent() {
    const start = this.cursor.position;
    while (!this.cursor.eof) {
      if (is.htmlCommentEnd(this.cursor)) {
        if (this.cursor.position > start) {
          this.tokens.push({
            type: TokenType.HtmlCommentContent,
            start: start,
            end: this.cursor.position,
            content: this.cursor.getChars(start),
          });
        }
        //  No Advancement Let the CommentEnd Consumer handle that
        return;
      }
      // Error :: Parser Will Resolve That
      if (is.htmlCommentStart(this.cursor)) {
        this.tokens.push({
          type: TokenType.HtmlCommentStart,
          start: start,
          end: this.cursor.position,
        });
        this.cursor.advanceBy(3);
      }

      this.cursor.advance();
    }

    this.tokens.push({
      type: TokenType.HtmlCommentContent,
      start: start,
      end: this.cursor.position,
      content: this.cursor.getChars(start),
    });

    this.tokens.push({
      type: TokenType.UnterminatedHtmlComment,
      start: start,
      end: this.cursor.position,
    });
  }

  /*===== Html Doctype Consumer =====*/
  private consumeDoctypeStart() {
    const start = this.cursor.position;
    this.cursor.advanceBy(9);
    this.tokens.push({
      type: TokenType.DoctypeStart,
      start,
      end: this.cursor.position,
    });
  }
  /*===== Html Attribute Consumer =====*/
  private consumeAttributeName() {
    const start = this.cursor.position;
    while (!this.cursor.eof) {
      const code = this.cursor.peek();
      if (!is.attributeNameChar(code)) {
        break;
      }
      this.cursor.advance();
    }

    if (this.cursor.position > start) {
      this.tokens.push({
        type: TokenType.AttributeName,
        start,
        end: this.cursor.position,
        content: this.cursor.getChars(start),
      });
    }
  }

  private consumeEqual() {
    if (this.cursor.peek() === chars.equals) {
      this.tokens.push({
        type: TokenType.Equals,
        start: this.cursor.position,
        end: this.cursor.position + 1,
      });
      this.cursor.advance();
    }
  }

  private consumeAttributeValue() {
    const code = this.cursor.peek();
    if (code === chars.openBrace) {
      this.consumeJsExpression()
    } else if (is.quote(code)) {
      this.consumeQuotedAttributeValue();
    } else {
      this.consumeUnquotedAttributeValue();
    }
  }

  private consumeQuotedAttributeValue() {
    const start = this.cursor.position;
    const quote = this.cursor.peek();
    this.cursor.advance();
    while (!this.cursor.eof) {
      const code = this.cursor.peek();
      if (code === quote) {
        this.cursor.advance();
        this.tokens.push({
          type: TokenType.QuotedAttributeValue,
          start,
          end: this.cursor.position,
          content: this.cursor.getChars(start),
        });
        return;
      }
      this.cursor.advance();
    }
    this.tokens.push({
      type: TokenType.QuotedAttributeValue,
      start,
      end: this.cursor.position,
      content: this.cursor.getChars(start),
    });
    this.tokens.push({
      type: TokenType.UnterminatedQuotedAttributeValue,
      start,
      end: this.cursor.position,
    });
  }

  private consumeUnquotedAttributeValue() {
    const start = this.cursor.position;
    while (!this.cursor.eof) {
      const code = this.cursor.peek();
      if (is.whitespace(code) || is.tagEnd(this.cursor)) {
        if (this.cursor.position > start) {
          this.tokens.push({
            type: TokenType.UnQuotedAttributeValue,
            start,
            end: this.cursor.position,
            content: this.cursor.getChars(start),
          });
        }
        return;
      }
      this.cursor.advance();
    }
  }
  /*===== JavaScript Expression Consumer =====*/
  consumeJsExpression() {
    const start = this.cursor.position;
    this.cursor.advance();
    const exprStart = this.cursor.position;
    const source = this.cursor.source;

    try {
      const expr = acorn.parseExpressionAt(source, exprStart, {
        ecmaVersion: 2022,
      });

      const exprEnd = expr.end;
this.skipWhiteSpace();

      if (this.cursor.peek() === chars.closeBrace) {
        this.cursor.advance();
        this.tokens.push({
          type: TokenType.JsExpression,
          start,
          end: this.cursor.position,
          content: this.cursor.getChars(start),
        });
      } else {
        this.tokens.push({
          type: TokenType.ExpectedClosingBrace,
          start,
          end: exprEnd,
        });
        this.cursor.advanceTo(exprEnd);
      }
    } catch (error) {
      this.tokens.push({
        type: TokenType.InvalidExpression,
        start: exprStart,
        end: this.cursor.position,
      });

      this.cursor.advance();
    }
  }
}
