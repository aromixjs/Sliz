import chars from "../scanner/chars";
import is from "../scanner/is";
import { CharacterCursor } from "./cursor";
import { resolveJsExpression } from "./jsResolver/jsResolver";
import { Token, TokenType } from "./token";

export class Tokenizer {
  protected cursor: CharacterCursor;
  protected tokens: Token[] = [];

  constructor(source: string) {
    this.cursor = new CharacterCursor(source);
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
      this.consumeJsExpressionAttributeValue();
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

  private consumeJsExpressionAttributeValue() {
    const start = this.cursor.position;
    const result = resolveJsExpression(this.cursor);
    this.tokens.push({
      type: TokenType.JsExpression,
      start,
      end: result.end,
      content: this.cursor.getChars(start),
    });

    let index = 0;
    while (index < result.issues.length) {
      const issue = result.issues[index];

      if (issue.kind === "unterminatedString") {
        this.tokens.push({
          type: TokenType.UnterminatedJsString,
          start: issue.start,
          end: issue.end,
        });
      }

      if (issue.kind === "unterminatedTemplate") {
        // TokenType.UnterminatedTemplateLiteral needs adding to ./token —
        // it did not exist before, since the old tokenizer folded this
        // case into UnterminatedJsString.
        this.tokens.push({
          type: TokenType.UnterminatedTemplateLiteral,
          start: issue.start,
          end: issue.end,
        });
      }
      if (issue.kind === "unterminatedBlockComment") {
        this.tokens.push({
          type: TokenType.UnterminatedBlockComment,
          start: issue.start,
          end: issue.end,
        });
      }

      if (issue.kind === "unterminatedExpression" || issue.kind === "tagLike") {
        this.tokens.push({
          type: TokenType.UnterminatedJsExpression,
          start: issue.start,
          end: issue.end,
        });
      }

      index++;
    }
  }
}
