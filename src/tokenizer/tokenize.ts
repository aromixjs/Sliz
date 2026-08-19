import { CharacterScanner } from "../common/CharacterScanner";
import { JsInterpolationResolver } from "../common/JsInterpolationResolver";
import { Token, TokenType } from "./token";

export class SlizTokenizer extends CharacterScanner<Token> {
  private readonly jsResolver: JsInterpolationResolver;
  private readonly unSupportedTagNames = new Set(["script", "style"]);

  constructor(source: string) {
    super(source);
    this.jsResolver = new JsInterpolationResolver(source);
  }

  /*===== Html Comments =====*/
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

  private consumeHtmlCommentStart() {
    const start = this.position;
    this.advanceBy(4);
    this.emit({ type: TokenType.CommentStart, start, end: this.position });
  }

  private consumeHtmlCommentContent() {
    const start = this.position;

    while (!this.eof && !this.isHtmlCommentEnd) {
      if (this.isHtmlCommentStart) {
        this.emit({ type: TokenType.CommentStart, start: this.position, end: this.position });
        this.advanceBy(4);
        continue;
      }

      this.advance();
    }

    this.emitIf(this.position > start, {
      type: TokenType.CommentContent,
      start,
      end: this.position,
      value: this.getChars(start),
    });

    this.emitIf(this.eof, {
      type: TokenType.UnterminatedComment,
      start,
      end: this.position,
    });
  }

  private consumeHtmlCommentEnd() {
    const start = this.position;
    this.advanceBy(3);
    this.emit({ type: TokenType.CommentEnd, start, end: this.position });
  }
  /*===== Html Doctype =====*/
  private get isHtmlDoctypeStart(): boolean {
    return this.source.slice(this.position, this.position + 9).toLowerCase() === "<!doctype";
  }

  private consumeOpeningDeclaration() {
    const start = this.position;
    this.advanceBy(2);
    this.emit({
      type: TokenType.OpeningDeclarationStart,
      start,
      end: this.position,
    });
  }

  // Sliz Tag Name is a merge of Js Identifier + html Tag rule
  private isSlizTagName(): boolean {
    const code = this.peek();
    const lowercaseChar = code >= this.lowerA && code <= this.lowerZ;
    const upperCaseChar = code >= this.upperA && code <= this.upperZ;
    const numberChar = code >= this.zero && code <= this.nine;
    return (
      lowercaseChar ||
      upperCaseChar ||
      numberChar ||
      code === this.underscore ||
      code === this.dollar ||
      code === this.dot ||
      code === this.minus ||
      code === this.colon
    );
  }

  private consumeTagName() {
    const nameStart = this.position;

    while (!this.eof && this.isSlizTagName) {
      this.advance();
    }

    const value = this.getChars(nameStart);
    this.emit({
      type: TokenType.TagName,
      start: nameStart,
      end: this.position,
      value,
    });

    this.emitIf(this.unSupportedTagNames.has(value.toLowerCase()), {
      type: TokenType.UnsupportedTagName,
      start: nameStart,
      end: this.position,
      value,
    });
  }

  public tokenize() {
    while (!this.eof) {
      if (this.isHtmlCommentStart) {
        this.consumeHtmlCommentStart();
        this.consumeHtmlCommentContent();
        continue;
      }

      if (this.isHtmlCommentEnd) {
        this.consumeHtmlCommentEnd();
        continue;
      }

      if (this.isHtmlDoctypeStart) {
        this.consumeOpeningDeclaration();
        this.consumeTagName();
        continue;
      }
    }

    return this.getTokens();
  }
}
