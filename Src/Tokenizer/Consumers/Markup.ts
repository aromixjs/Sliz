import Char from "../../Scanner/Char";
import Is from "../../Scanner/Is";
import {  TokenizerContext } from "../Token";
import { ConsumeClosingTag } from "./ClosingTag";
import { ConsumeDoctype } from "./Doctype";
import { ConsumeHtmlComment } from "./HtmlComment";
import { ConsumeOpeningTag } from "./OpeningTag";

export function ConsumeMarkup(Ctx: TokenizerContext) {
   const Cursor = Ctx.Cursor;

   if (Cursor.Peek() === Char.LessThan && Cursor.Peek(1) === Char.ExclamationMark) {

      if (Cursor.Peek(2) === Char.Minus && Cursor.Peek(3) === Char.Minus) {
         ConsumeHtmlComment(Ctx);
         return;
      }

      if (Is.Doctype(Ctx)) {
         ConsumeDoctype(Ctx);
         return;
      }

   }

   // </
   if (Cursor.Peek() === Char.LessThan && Cursor.Peek(1) === Char.Slash) {
      ConsumeClosingTag(Ctx);
      return;
   }

   // <
   ConsumeOpeningTag(Ctx);
}



