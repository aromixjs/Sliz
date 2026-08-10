import { TokenizerContext } from "../Tokenizer/Token";
import Char from "./Char";

export default {
  Whitespace(Code: number) {
    return Code === Char.Space || Code === Char.Tab || Code === Char.LineFeed ||
      Code === Char.CarriageReturn;
  },

  Alpha(Code: number) {
    return (Code >= Char.LowerA && Code <= Char.LowerZ) ||
      (Code >= Char.UpperA && Code <= Char.UpperZ);
  },

  Quote(Code: number): boolean {
    return Code === Char.SingleQuote || Code === Char.DoubleQuote ||
      Code === Char.Backtick;
  },

  RegexStart(Source: string, Position: number) {
    let LocalPosition = Position - 1;
    while (LocalPosition >= 0) {
      const Code = Source.charCodeAt(LocalPosition);
      if (!this.Whitespace(Code)) {
        switch (Code) {
          case Char.Equals:
          case Char.OpenParen:
          case Char.OpenBracket:
          case Char.OpenBrace:
          case Char.Semicolon:
          case Char.Comma:
          case Char.ExclamationMark:
          case Char.Ampersand:
          case Char.Pipe:
          case Char.QuestionMark:
          case Char.Caret:
          case Char.Plus:
          case Char.Minus:
          case Char.Percent:
          case Char.Asterisk:
          case Char.Colon:
            return true;
          default:
            return false;
        }
      }
      LocalPosition--;
    }

    return true;
  },

  IdentifierStart(Code: number) {
    return this.Alpha(Code) || Code === Char.Underscore || Code === Char.Dollar;
  },

  AttributeName(Code: number) {
    return (Code > Char.Space && Code !== Char.Equals &&
      Code !== Char.GreaterThan && Code !== Char.DoubleQuote &&
      Code !== Char.SingleQuote && Code !== Char.Slash &&
      Code !== Char.OpenBrace && Code !== Char.CloseBrace);
  },


  Doctype(Ctx: TokenizerContext) {
    const Cursor = Ctx.Cursor;

    return (
      Cursor.Peek() === Char.LessThan &&
      Cursor.Peek(1) === Char.ExclamationMark &&
      (Cursor.Peek(2) === Char.UpperD || Cursor.Peek(2) === Char.LowerD) &&
      (Cursor.Peek(3) === Char.UpperO || Cursor.Peek(3) === Char.LowerO) &&
      (Cursor.Peek(4) === Char.UpperC || Cursor.Peek(4) === Char.LowerC) &&
      (Cursor.Peek(5) === Char.UpperT || Cursor.Peek(5) === Char.LowerT) &&
      (Cursor.Peek(6) === Char.UpperY || Cursor.Peek(6) === Char.LowerY) &&
      (Cursor.Peek(7) === Char.UpperP || Cursor.Peek(7) === Char.LowerP) &&
      (Cursor.Peek(8) === Char.UpperE || Cursor.Peek(8) === Char.LowerE)
    );
  }


};
