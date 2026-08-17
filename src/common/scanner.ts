import { CharacterCursor } from "./cursor";

export class CharacterScanner<Token> {
  private readonly cursor: CharacterCursor;
  private readonly tokens: Array<Token> = [];

  constructor(source: string) {
    this.cursor = new CharacterCursor(source);
  }

  /*===== Character codes =====*/
  protected readonly null = 0;
  protected readonly backspace = 8;
  protected readonly tab = 9;
  protected readonly lineFeed = 10;
  protected readonly verticalTab = 11;
  protected readonly formFeed = 12;
  protected readonly carriageReturn = 13;
  protected readonly space = 32;

  protected readonly exclamationMark = 33;
  protected readonly doubleQuote = 34;
  protected readonly hash = 35;
  protected readonly dollar = 36;
  protected readonly percent = 37;
  protected readonly ampersand = 38;
  protected readonly singleQuote = 39;

  protected readonly openParen = 40;
  protected readonly closeParen = 41;
  protected readonly asterisk = 42;
  protected readonly plus = 43;
  protected readonly comma = 44;
  protected readonly minus = 45;
  protected readonly dot = 46;
  protected readonly slash = 47;

  protected readonly colon = 58;
  protected readonly semicolon = 59;
  protected readonly lessThan = 60;
  protected readonly equals = 61;
  protected readonly greaterThan = 62;
  protected readonly questionMark = 63;
  protected readonly at = 64;

  protected readonly upperA = 65;
  protected readonly upperB = 66;
  protected readonly upperC = 67;
  protected readonly upperD = 68;
  protected readonly upperE = 69;
  protected readonly upperF = 70;
  protected readonly upperG = 71;
  protected readonly upperH = 72;
  protected readonly upperI = 73;
  protected readonly upperJ = 74;
  protected readonly upperK = 75;
  protected readonly upperL = 76;
  protected readonly upperM = 77;
  protected readonly upperN = 78;
  protected readonly upperO = 79;
  protected readonly upperP = 80;
  protected readonly upperQ = 81;
  protected readonly upperR = 82;
  protected readonly upperS = 83;
  protected readonly upperT = 84;
  protected readonly upperU = 85;
  protected readonly upperV = 86;
  protected readonly upperW = 87;
  protected readonly upperX = 88;
  protected readonly upperY = 89;
  protected readonly upperZ = 90;

  protected readonly openBracket = 91;
  protected readonly backslash = 92;
  protected readonly closeBracket = 93;
  protected readonly caret = 94;
  protected readonly underscore = 95;
  protected readonly backtick = 96;

  protected readonly lowerA = 97;
  protected readonly lowerB = 98;
  protected readonly lowerC = 99;
  protected readonly lowerD = 100;
  protected readonly lowerE = 101;
  protected readonly lowerF = 102;
  protected readonly lowerG = 103;
  protected readonly lowerH = 104;
  protected readonly lowerI = 105;
  protected readonly lowerJ = 106;
  protected readonly lowerK = 107;
  protected readonly lowerL = 108;
  protected readonly lowerM = 109;
  protected readonly lowerN = 110;
  protected readonly lowerO = 111;
  protected readonly lowerP = 112;
  protected readonly lowerQ = 113;
  protected readonly lowerR = 114;
  protected readonly lowerS = 115;
  protected readonly lowerT = 116;
  protected readonly lowerU = 117;
  protected readonly lowerV = 118;
  protected readonly lowerW = 119;
  protected readonly lowerX = 120;
  protected readonly lowerY = 121;
  protected readonly lowerZ = 122;

  protected readonly openBrace = 123;
  protected readonly pipe = 124;
  protected readonly closeBrace = 125;
  protected readonly tilde = 126;
  /*===== Token emission =====*/
  protected emit(token: Token): void {
    this.tokens.push(token);
  }

  protected emitIf(condition: boolean, token: Token): void {
    if (condition) {
      this.tokens.push(token);
    }
  }
  getTokens() {
    return this.tokens;
  }

  /*===== Cursor passthrough :: [implementers should never touch CharacterCursor directly] =====*/
  protected get position(): number {
    return this.cursor.position;
  }

  protected get eof(): boolean {
    return this.cursor.eof;
  }
  protected peek(): number {
    return this.cursor.peek();
  }

  protected peekAtOffset(offset: number): number {
    return this.cursor.peekAtOffset(offset);
  }

  protected advance(): void {
    this.cursor.advance();
  }
  protected advanceBy(offset: number): void {
    this.cursor.advanceBy(offset);
  }
  protected advanceIf(condition: boolean): void {
    this.cursor.advanceIf(condition);
  }
  protected advanceTo(position:number) {
    
    this.cursor.advanceTo(position)
  }

  protected getChars(start: number): string {
    return this.cursor.getChars(start);
  }

  /*===== Generic character-class checks :: [shared across every language] =====*/

  protected get isWhitespace(): boolean {
    const code = this.cursor.peek();
    return (
      code === this.space ||
      code === this.tab ||
      code === this.lineFeed ||
      code === this.carriageReturn
    );
  }

  protected isAlpha(code: number): boolean {
    return (
      (code >= this.lowerA && code <= this.lowerZ) || (code >= this.upperA && code <= this.upperZ)
    );
  }

  protected isQuote(code: number): boolean {
    return code === this.singleQuote || code === this.doubleQuote;
  }

  protected skipWhiteSpace() {
    while (!this.eof && !this.isWhitespace) {
      this.cursor.advance();
    }
  }

  /*===== HTML checks =====*/
  protected isHtmlAttributeNameChar(code: number): boolean {
    return (
      code !== this.space &&
      code !== this.tab &&
      code !== this.lineFeed &&
      code !== this.carriageReturn &&
      code !== this.singleQuote &&
      code !== this.doubleQuote &&
      code !== this.greaterThan &&
      code !== this.slash &&
      code !== this.equals
    );
  }

  protected get isHtmlTagLike(): boolean {
    const next = this.cursor.peekAtOffset(1);
    return (
      this.cursor.peek() === this.lessThan &&
      (this.isAlpha(next) || next === this.slash || next === this.exclamationMark)
    );
  }

  protected get isHtmlClosingTagStart(): boolean {
    return (
      this.cursor.peek() === this.lessThan &&
      this.cursor.peekAtOffset(1) === this.slash &&
      this.isAlpha(this.cursor.peekAtOffset(2))
    );
  }

  protected get isHtmlTagEnd(): boolean {
    return (
      this.cursor.peek() === this.greaterThan ||
      (this.cursor.peek() === this.slash && this.cursor.peekAtOffset(1) === this.greaterThan)
    );
  }

  protected get isHtmlSelfClosingTagEnd(): boolean {
    return this.cursor.peek() === this.slash && this.cursor.peekAtOffset(1) === this.greaterThan;
  }

  protected get isHtmlDoctypeStart(): boolean {
    return (
      this.cursor.peek() === this.lessThan &&
      this.cursor.peekAtOffset(1) === this.exclamationMark &&
      (this.cursor.peekAtOffset(2) === this.upperD ||
        this.cursor.peekAtOffset(2) === this.lowerD) &&
      (this.cursor.peekAtOffset(3) === this.upperO ||
        this.cursor.peekAtOffset(3) === this.lowerO) &&
      (this.cursor.peekAtOffset(4) === this.upperC ||
        this.cursor.peekAtOffset(4) === this.lowerC) &&
      (this.cursor.peekAtOffset(5) === this.upperT ||
        this.cursor.peekAtOffset(5) === this.lowerT) &&
      (this.cursor.peekAtOffset(6) === this.upperY ||
        this.cursor.peekAtOffset(6) === this.lowerY) &&
      (this.cursor.peekAtOffset(7) === this.upperP ||
        this.cursor.peekAtOffset(7) === this.lowerP) &&
      (this.cursor.peekAtOffset(8) === this.upperE || this.cursor.peekAtOffset(8) === this.lowerE)
    );
  }

  protected get isHtmlCommentStart(): boolean {
    return (
      this.cursor.peek() === this.lessThan &&
      this.cursor.peekAtOffset(1) === this.exclamationMark &&
      this.cursor.peekAtOffset(2) === this.minus &&
      this.cursor.peekAtOffset(3) === this.minus
    );
  }

  protected get isHtmlCommentEnd(): boolean {
    return (
      this.cursor.peek() === this.minus &&
      this.cursor.peekAtOffset(1) === this.minus &&
      this.cursor.peekAtOffset(2) === this.greaterThan
    );
  }

  /*===== JS checks=====*/
  protected get isJsLineCommentStart(): boolean {
    return this.cursor.peek() === this.slash && this.cursor.peekAtOffset(1) === this.slash;
  }
  protected get isJsBlockCommentStart(): boolean {
    return this.cursor.peek() === this.slash && this.cursor.peekAtOffset(1) === this.asterisk;
  }
}
