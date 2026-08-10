import Char from "../../Scanner/Char";
import Is from "../../Scanner/Is";
import Skip from "../../Scanner/Skip";
import { SyntaxKind, TokenizerContext } from "../Token";
import { ConsumeExpression } from "./Expression";

export function ConsumeAttributes(Ctx: TokenizerContext) {

   while (!Ctx.Cursor.Eof) {
      Skip.whiteSpace(Ctx.Cursor)
      const Code = Ctx.Cursor.Peek();

      // End of opening tag.
      if (
         Code === Char.GreaterThan ||
         (Code === Char.Slash && Ctx.Cursor.Peek(1) === Char.GreaterThan)
      ) {
         return;
      }

      ConsumeAttribute(Ctx)
   }
}




export function ConsumeAttribute(Ctx: TokenizerContext) {
   const Start = Ctx.Cursor.Clone();


   while (!Ctx.Cursor.Eof) {
      const Code = Ctx.Cursor.Peek();

      if (
         Is.Whitespace(Code) ||
         Code === Char.Equals ||
         Code === Char.GreaterThan ||
         Code === Char.Slash
      ) {
         break;
      }


      Ctx.Cursor.Advance();
   }


   if (Ctx.Cursor.Position === Start.Position) {
      return;
   }

   Ctx.Tokens.push({
      Kind: SyntaxKind.AttributeName,
      Start: Start.Position,
      End: Ctx.Cursor.Position,
      Value: Ctx.Cursor.GetChars(Start),
   });

   Skip.WhiteSpace(Ctx.Cursor);

   if (Ctx.Cursor.Peek() !== Char.Equals) {
      return;
   }


   Ctx.Cursor.Advance();

   Skip.WhiteSpace(Ctx.Cursor);

   ConsumeAttributeValue(Ctx);
}


export function ConsumeAttributeValue(Ctx: TokenizerContext) {
   const Code = Ctx.Cursor.Peek();

   if (Code === Char.OpenBrace) {
      ConsumeExpression(Ctx);
      return;
   }

   if (
      Code === Char.SingleQuote ||
      Code === Char.DoubleQuote
   ) {
      ConsumeQuotedAttributeValue(Ctx);
      return;
   }
   ConsumeUnquotedAttributeValue(Ctx);
}