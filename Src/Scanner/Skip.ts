import Char from "./Char";
import Is from "./Is";

export default {
  whiteSpace(Source: string, Cursor: number) {
    while (Cursor < Source.length) {
      const Code = Source.charCodeAt(Cursor);

      if (
        Code !== Char.Space &&
        Code !== Char.Tab &&
        Code !== Char.LineFeed &&
        Code !== Char.CarriageReturn
      ) {
        break;
      }

      Cursor++;
    }

    return Cursor;
  },

  LineComment(Source: string, Start: number) {
    let Position = Start + 2;
    while (
      Position < Source.length && Source.charCodeAt(Position) !== Char.LineFeed
    ) {
      Position++;
    }

    return Position;
  },
  blockComment(Source: string, Start: number) {
    let Position = Start + 2;

    while (Position < Source.length) {
      if (
        Source.charCodeAt(Position) === Char.Asterisk &&
        Source.charCodeAt(Position + 1) === Char.Slash
      ) {
        return Position + 2;
      }

      Position++;
    }

    return Position;
  },
  string(Source: string, Start: number) {
    const QuoteCode = Source.charCodeAt(Start);
    let Position = Start + 1;

    while (Position < Source.length) {
      const Code = Source.charCodeAt(Position);

      if (Code === Char.Backslash) {
        Position += 2;
      } else if (Code === QuoteCode) {
        return Position + 1;
      } else {
        Position++;
      }
    }

    return Position;
  },

  template(Source: string, Start: number) {
    let Position = Start + 1;

    while (Position < Source.length) {
      const Code = Source.charCodeAt(Position);

      if (Code === Char.Backslash) {
        Position += 2;
        continue;
      }

      if (Code === Char.Backtick) {
        return Position + 1;
      }

      if (
        Code === Char.Dollar &&
        Source.charCodeAt(Position + 1) === Char.OpenBrace
      ) {
        Position = this.BraceExpression(Source, Position + 2);
        continue;
      }

      Position++;
    }

    return Position;
  },

  BraceExpression(Source: string, Start: number) {
    let Position = Start + 1;
    let Depth = 1;

    while (Position < Source.length) {
      const Code = Source.charCodeAt(Position);

      if (Code === Char.Backslash) {
        Position += 2;
        continue;
      }

      if (Code === Char.SingleQuote || Code === Char.DoubleQuote) {
        Position = this.string(Source, Position);
        continue;
      }

      if (Code === Char.Backtick) {
        Position = this.template(Source, Position);
        continue;
      }

      if (Code === Char.OpenBrace) {
        Depth++;
      } else if (Code === Char.CloseBrace) {
        Depth--;

        if (Depth === 0) {
          return Position + 1;
        }
      }

      Position++;
    }

    return -1;
  },

  Regex(Source: string, Start: number) {
    let Position = Start + 1;
    let InCharClass = false;

    while (Position < Source.length) {
      const Code = Source.charCodeAt(Position);

      if (Code === Char.Backslash) {
        Position += 2;
        continue;
      }

      if (Code === Char.LineFeed) {
        return Start + 1;
      }

      if (Code === Char.OpenBracket) {
        InCharClass = true;
      }

      if (Code === Char.CloseBracket) {
        InCharClass = false;
      }

      if (Code === Char.Slash && !InCharClass) {
        Position++;

        const Code = Source.charCodeAt(Position);
        while (Position < Source.length && Is.Alpha(Code)) {
          Position++;
        }

        return Position;
      }

      Position++;
    }

    return Position;
  },
};
