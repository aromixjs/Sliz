import { CharacterCursor } from "../tokenizer/cursor";
import char from "./char";
import { is } from "./is";


export namespace skip {
  export function whiteSpace(cursor:CharacterCursor) {
    while (!cursor.eof) {
       const code = cursor.peek();

    if (
      code !== char.space &&
      code !== char.tab &&
      code !== char.lineFeed &&
      code !== char.carriageReturn
    ) {
      break;
    }

      cursor.advance();
    }
  }

  export function lineComment(source: string, start: number) {
    let position = start + 2;
    while (
      position < source.length && source.charCodeAt(position) !== char.lineFeed
    ) {
      position++;
    }

    return position;
  }

  export function blockComment(source: string, start: number) {
    let position = start + 2;

    while (position < source.length) {
      if (
        source.charCodeAt(position) === char.asterisk &&
        source.charCodeAt(position + 1) === char.slash
      ) {
        return position + 2;
      }

      position++;
    }

    return position;
  }

  export function string(source: string, start: number) {
    const quoteCode = source.charCodeAt(start);
    let position = start + 1;

    while (position < source.length) {
      const code = source.charCodeAt(position);

      if (code === char.backslash) {
        position += 2;
      } else if (code === quoteCode) {
        return position + 1;
      } else {
        position++;
      }
    }

    return position;
  }

  export function template(source: string, start: number) {
    let position = start + 1;

    while (position < source.length) {
      const code = source.charCodeAt(position);

      if (code === char.backslash) {
        position += 2;
        continue;
      }

      if (code === char.backtick) {
        return position + 1;
      }

      if (
        code === char.dollar &&
        source.charCodeAt(position + 1) === char.openBrace
      ) {
        position = skip.braceExpression(source, position + 2);
        continue;
      }

      position++;
    }

    return position;
  }




/**
 * Finds where a `{ ... }` expression ends, safely skipping over inner braces, strings, and escape characters.
 * 
 * **How it works:**
 * 1. Starts inside the outer `{` and tracks "depth" (starts at 1).
 * 2. Ignores escaped characters (e.g., `\{`) so they don't count as real braces.
 * 3. Skips over strings `'...'`, `"..."`, and template literals `` `...` `` so braces inside text are ignored.
 * 4. Adds to `depth` for every `{` and subtracts for every `}`.
 * 5. Returns the index after the matching `}` when `depth` hits 0 (or `-1` if it never closes).
 * 
 * @param source The full source code string being parsed.
 * @param start The character index where the opening `{` is located.
 * @returns The character index immediately after the closing `}`, or `-1` if unmatched.
 */
  export function braceExpression(source: string, start: number) {
    let position = start + 1;
    let depth = 1;

    while (position < source.length) {
      const code = source.charCodeAt(position);

      if (code === char.backslash) {
        position += 2;
        continue;
      }

      if (code === char.singleQuote || code === char.doubleQuote) {
        position = skip.string(source, position);
        continue;
      }

      if (code === char.backtick) {
        position = skip.template(source, position);
        continue;
      }

      if (code === char.openBrace) {
        depth++;
      } else if (code === char.closeBrace) {
        depth--;

        if (depth === 0) {
          return position + 1;
        }
      }

      position++;
    }

    return -1;
  }

  export function regex(source: string, start: number) {
    let position = start + 1;
    let inCharClass = false;

    while (position < source.length) {
      const code = source.charCodeAt(position);

      if (code === char.backslash) {
        position += 2;
        continue;
      }

      if (code === char.lineFeed) {
        return start + 1;
      }

      if (code === char.openBracket) {
        inCharClass = true;
      }

      if (code === char.closeBracket) {
        inCharClass = false;
      }

      if (code === char.slash && !inCharClass) {
        position++;

        const code = source.charCodeAt(position);
        while (position < source.length && is.alpha(code)) {
          position++;
        }

        return position;
      }

      position++;
    }

    return position;
  }
};
