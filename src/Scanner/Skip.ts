import Char from "./Char";
import Is from "./Is";

export default {
  whiteSpace(Source: string, Cursor: number) {
    while (Cursor < Source.length) {
      const Code = Source.charCodeAt(Cursor);

      if (
        Code !== Char.space &&
        Code !== Char.tab &&
        Code !== Char.lineFeed &&
        Code !== Char.carriageReturn
      ) {
        break;
      }

      Cursor++;
    }

    return Cursor;
  },

  lineComment(Source: string, Start: number) {
    let Position = Start + 2;
    while (
      Position < Source.length && Source.charCodeAt(Position) !== Char.lineFeed
    ) {
      Position++;
    }

    return Position;
  },
  blockComment(Source: string, Start: number) {
    let Position = Start + 2;

    while (Position < Source.length) {
      if (
        Source.charCodeAt(Position) === Char.asterisk &&
        Source.charCodeAt(Position + 1) === Char.slash
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

      if (Code === Char.backslash) {
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

      if (Code === Char.backslash) {
        Position += 2;
        continue;
      }

      if (Code === Char.backtick) {
        return Position + 1;
      }

      if (
        Code === Char.dollar &&
        Source.charCodeAt(Position + 1) === Char.openBrace
      ) {
        Position = this.braceExpression(Source, Position + 2);
        continue;
      }

      Position++;
    }

    return Position;
  },

  braceExpression(Source: string, Start: number) {
    let Position = Start + 1;
    let Depth = 1;

    while (Position < Source.length) {
      const Code = Source.charCodeAt(Position);

      if (Code === Char.backslash) {
        Position += 2;
        continue;
      }

      if (Code === Char.singleQuote || Code === Char.doubleQuote) {
        Position = this.string(Source, Position);
        continue;
      }

      if (Code === Char.backtick) {
        Position = this.template(Source, Position);
        continue;
      }

      if (Code === Char.openBrace) {
        Depth++;
      } else if (Code === Char.closeBrace) {
        Depth--;

        if (Depth === 0) {
          return Position + 1;
        }
      }

      Position++;
    }

    return -1;
  },
  regex(Source: string, Start: number) {
    let Position = Start + 1;
    let InCharClass = false;

    while (Position < Source.length) {
      const Code = Source.charCodeAt(Position);

      if (Code === Char.backslash) {
        Position += 2;
        continue;
      }

      if (Code === Char.lineFeed) {
        return Start + 1;
      }

      if (Code === Char.openBracket) {
        InCharClass = true;
      }

      if (Code === Char.closeBracket) {
        InCharClass = false;
      }

      if (Code === Char.slash && !InCharClass) {
        Position++;

        const Code = Source.charCodeAt(Position);
        while (Position < Source.length && Is.alpha(Code)) {
          Position++;
        }

        return Position;
      }

      Position++;
    }

    return Position;
  },
};
