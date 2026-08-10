import Char from "../../Scanner/Char";
import Is from "../../Scanner/Is";
import Skip from "../../Scanner/Skip";
import { Matcher, SyntaxKind } from "../Token";

export const Text: Matcher = (Ctx) => {
   let Start = Ctx.cursor;

   while (Ctx.cursor < Ctx.source.length) {
      const Code = Ctx.source.charCodeAt(Ctx.cursor);
if (
      Code === Char.lessThan ||
      Code === Char.greaterThan ||
      Code === Char.openBrace ||
      Code === Char.closeBrace ||
      Code === Char.slash
    ) {
      break;
    }

      Ctx.cursor++;
   }


   if (Ctx.cursor > Start) {
      Ctx.tokens.push({
         Kind: SyntaxKind.Text,
         Start: Start,
         End: Ctx.cursor,
         Value: Ctx.source.slice(Start, Ctx.cursor),
      });
   }
};

export const LessThan: Matcher = (C) => {
   const { source, cursor, } = C;
   const Current = source.charCodeAt(cursor);

   if (Current === Char.lessThan) {
      C.tokens.push({
         Kind: SyntaxKind.LessThan,
         Start: cursor,
         End: cursor + 1,
         Value: "<",
      });

      C.cursor++;
   }
};

export const OpenBrace: Matcher = (C) => {
   const { source, cursor } = C;

   if (source.charCodeAt(cursor) === Char.openBrace) {
      C.tokens.push({
         Kind: SyntaxKind.OpenBrace,
         Start: cursor,
         End: cursor + 1,
         Value: "{",
      });

      C.cursor++;
   }

};

export const JsExpression: Matcher = (C) => {
   const { source, cursor, tokens } = C;

   const LastToken = tokens.at(-1)
   if (LastToken?.Kind !== SyntaxKind.OpenBrace) {
      return
   }

   const End = Skip.braceExpression(source, cursor - 1);
   if (End === -1) {
      tokens.push({
         Kind: SyntaxKind.JsExpression,
         Start: cursor,
         End: source.length,
         Value: source.slice(cursor),
      });

      C.cursor = source.length
   } else {
      tokens.push({
         Kind: SyntaxKind.JsExpression,
         Start: cursor,
         End: End - 1,
         Value: source.slice(cursor, End - 1),
      })

      C.cursor = End - 1
   }
};

export const CloseBrace: Matcher = (C) => {
   const { source, cursor, tokens } = C;

   if (source.charCodeAt(cursor) === Char.closeBrace) {

      tokens.push({
         Kind: SyntaxKind.CloseBrace,
         Start: cursor,
         End: cursor + 1,
         Value: "}",
      })
      C.cursor++
   }

};

export const Slash: Matcher = (C) => {
   const { source, cursor } = C;

   if (source.charCodeAt(cursor) === Char.slash) {

      C.tokens.push({
         Kind: SyntaxKind.Slash,
         Start: cursor,
         End: cursor + 1,
         Value: "/",
      });

      C.cursor++;
   }

};

export const TagName: Matcher = (C) => {
   const { source, cursor, tokens } = C;

   const Previous = tokens.at(-1);
   const BeforePrevious = tokens.at(-2);
   const IsTagName = Previous?.Kind === SyntaxKind.LessThan || (Previous?.Kind === SyntaxKind.Slash && BeforePrevious?.Kind === SyntaxKind.LessThan)

   if (!IsTagName) {
      return;
   }


   let End = cursor;
   while (End < source.length) {
      const Code = source.charCodeAt(End);

      if (Is.whitespace(Code) || Code === Char.greaterThan || Code === Char.slash) {
         break;
      }

      End++;
   }

   if (End > cursor) {
      C.tokens.push({
         Kind: SyntaxKind.TagName,
         Start: cursor,
         End: End,
         Value: source.slice(cursor, End),
      });

      C.cursor = End;
   }


};
