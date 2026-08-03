import { Char } from "./codes";

export class BaseMatcher {
  skipWhiteSpace(source: string, cursor: number): number {
    while (cursor < source.length) {
      const code = source.charCodeAt(cursor);
      if (
        code !== Char.Space &&
        code !== Char.Tab &&
        code !== Char.LineFeed &&
        code !== Char.CarriageReturn
      ) {
        break;
      }
      cursor++;
    }
    return cursor;
  }

  matchWord(source: string, cursor: number, word: string): boolean {
    if (cursor + word.length > source.length) {
      return false;
    }

    for (let i = 0; i < word.length; i++) {
      if (source.charCodeAt(cursor + i) !== word.charCodeAt(i)) {
        return false;
      }
    }
    return true;
  }

  matchServerEnd(source: string, cursor: number) {
    if (source.charCodeAt(cursor) !== Char.LessThan) {
      return undefined;
    }

    let position = cursor + 1;
    position = this.skipWhiteSpace(source, position);

    if (source.charCodeAt(position) !== Char.Slash) {
      return undefined;
    }

    position++;
    position = this.skipWhiteSpace(source, position);

    if (!this.matchWord(source, position, "server")) {
      return undefined;
    }

    position += "server".length;

    position = this.skipWhiteSpace(source, position);

    if (source.charCodeAt(position) !== Char.GreaterThan) {
      return undefined;
    }
    return position + 1;
  }
}
