import is from "../scanner/is";
import { CharacterCursor } from "./cursor";
import { Token, TokenType } from "./token";

export class Tokenizer {
  private cursor: CharacterCursor;
  tokens: Token[] = [];

  constructor(source: string) {
    this.cursor = new CharacterCursor(source);
  }

  tokenize() {
    while (!this.cursor.eof) {
      if (is.htmlCommentStart(this.cursor)) {
        this.consumeHtmlCommentStart();
        this.consumeHtmlCommentContent();
        this.consumeHtmlCommentEnd();
      }
    }
  }

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
        this.tokens.push({
          type: TokenType.HtmlCommentContent,
          start: start,
          end: this.cursor.position,
          content: this.cursor.getChars(start),
        });
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
}
