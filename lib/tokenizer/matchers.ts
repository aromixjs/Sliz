import { BaseMatcher } from "./base.matcher";
import { Char } from "./codes";
import {
   LexerContext,
   LexerMode,
   MatchResult,
   SyntaxKind,
   TokenMatcher,
} from "./types";

export class ServerStartMatcher extends BaseMatcher implements TokenMatcher {
   match(ctx: LexerContext): MatchResult | undefined {
      if (ctx.mode !== LexerMode.Root) return undefined;

      const { source, cursor } = ctx;
      if (source.charCodeAt(cursor) !== Char.LessThan) return undefined;

      let position = cursor + 1;
      position = this.skipWhiteSpace(source, position);

      if (!this.matchWord(source, position, "server")) return undefined;
      position += "server".length;

      const afterNameCode = source.charCodeAt(position);
      if (
         afterNameCode !== Char.GreaterThan &&
         afterNameCode !== Char.Space &&
         afterNameCode !== Char.Tab &&
         afterNameCode !== Char.LineFeed &&
         afterNameCode !== Char.CarriageReturn
      ) {
         return undefined;
      }

      position = this.skipWhiteSpace(source, position);
      if (source.charCodeAt(position) !== Char.GreaterThan) return undefined;

      return {
         token: {
            kind: SyntaxKind.ServerStartToken,
            start: cursor,
            end: position + 1,
            value: source.slice(cursor, position + 1),
         },
         nextCursor: position + 1,
         nextMode: LexerMode.Server,
      };
   }
}

export class ServerEndMatcher extends BaseMatcher implements TokenMatcher {
   match(ctx: LexerContext): MatchResult | undefined {
      if (ctx.mode !== LexerMode.Server) return;
      const { source, cursor } = ctx;
      const result = this.matchServerEnd(source, cursor);
      if (!result) return undefined;

      return {
         token: {
            kind: SyntaxKind.ServerEndToken,
            start: cursor,
            end: result,
            value: source.slice(cursor, result),
         },
         nextCursor: result,
         nextMode: LexerMode.Root,
      };
   }
}

export class ServerCodeMatcher extends BaseMatcher implements TokenMatcher {
   private isQuote(code: number): boolean {
      return code === Char.SingleQuote || code === Char.DoubleQuote ||
         code === Char.Backtick;
   }

   private skipString(source: string, start: number) {
      const quoteCode = source.charCodeAt(start);
      let position = start + 1;
      while (position < source.length) {
         const code = source.charCodeAt(position);
         if (code === Char.Backslash) {
            position += 2;
         } else if (code === quoteCode) {
            return position + 1;
         } else {
            position++;
         }
      }

      return position;
   }

   private skipLineComment(source: string, start: number) {
      let position = start + 2;
      while (
         position < source.length && source.charCodeAt(position) !== Char.LineFeed
      ) {
         position++;
      }

      return position;
   }

   private skipBlockComment(source: string, start: number) {
      let position = start + 2;
      while (position < source.length) {
         if (
            source.charCodeAt(position) === Char.Asterisk &&
            source.charCodeAt(position + 1) === Char.Slash
         ) {
            return position + 2;
         }

         position++;
      }

      return position;
   }

   private isWhiteSpace(code: number) {
      return code === Char.Space || code === Char.Tab || code === Char.LineFeed ||
         code === Char.CarriageReturn;
   }

   private isAlpha(code: number) {
      return (code >= Char.LowerA && code <= Char.LowerZ) ||
         (code >= Char.UpperA && code <= Char.UpperZ);
   }

   private isRegexStart(source: string, position: number) {
      let localPosition = position - 1;

      while (
         localPosition >= 0 && this.isWhiteSpace(source.charCodeAt(localPosition))
      ) {
         localPosition--;
      }

      if (localPosition < 0) {
         return true;
      }

      switch (source.charCodeAt(localPosition)) {
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

   private skipRegex(source: string, start: number) {
      let position = start + 1;
      let inCharClass = false;

      while (position < source.length) {
         const code = source.charCodeAt(position);

         if (code === Char.Backslash) {
            position += 2;
            continue;
         }

         if (code === Char.LineFeed) {
            return start + 1;
         }

         if (code === Char.OpenBracket) {
            inCharClass = true;
         }

         if (code === Char.CloseBracket) {
            inCharClass = false;
         }

         if (code === Char.Slash && !inCharClass) {
            position++;
            while (
               position < source.length && this.isAlpha(source.charCodeAt(position))
            ) {
               position++;
            }

            return position;
         }

         position++;
      }

      return position;
   }

   match(ctx: LexerContext): MatchResult | undefined {
      if (ctx.mode !== LexerMode.Server) return undefined;
      const { source, cursor } = ctx;
      let position = cursor;

      while (position < source.length) {
         const code = source.charCodeAt(position);

         if (this.isQuote(code)) {
            position = this.skipString(source, position);
            continue;
         }


         if (code === Char.Slash) {
            const next = source.charCodeAt(position + 1);

            if (next === Char.Slash) {
               position = this.skipLineComment(source, position);
               continue;
            }

            if (next === Char.Asterisk) {
               position = this.skipBlockComment(source, position);
               continue;
            }

            if (this.isRegexStart(source, position)) {
               position = this.skipRegex(source, position);
               continue;
            }
         }

         if (this.matchServerEnd(source, position)) {
            break
         }

         position++
      }

      if (position === cursor) return undefined;

      return {
         token: {
            kind: SyntaxKind.ServerCodeToken,
            start: cursor,
            end: position,
            value: source.slice(cursor, position),
         },
         nextCursor: position,
      };
   }
}




export class HtmlChunkMatcher extends BaseMatcher implements TokenMatcher {

   private isServerStartAt(source: string, cursor: number) {
      if (source.charCodeAt(cursor) !== Char.LessThan) return false;
      let position = cursor + 1;
      position = this.skipWhiteSpace(source, position);
      if (!this.matchWord(source, position, "server")) return false;
      position += "server".length;
      const afterNameCode = source.charCodeAt(position);
      return (
         afterNameCode === Char.GreaterThan ||
         afterNameCode === Char.Space ||
         afterNameCode === Char.Tab ||
         afterNameCode === Char.LineFeed ||
         afterNameCode === Char.CarriageReturn
      );
   }


   match(ctx: LexerContext): MatchResult | undefined {
      if (ctx.mode !== LexerMode.Root) return undefined;

      const { source, cursor } = ctx;
      let position = cursor;
      while (position < source.length) {
         if (this.isServerStartAt(source, position)) break;
         position++;
      }

      if (position === cursor) return undefined;

      return {
         token: {
            kind: SyntaxKind.HtmlToken,
            start: cursor,
            end: position,
            value: source.slice(cursor, position),
         },
         nextCursor: position,
      };


   }




}