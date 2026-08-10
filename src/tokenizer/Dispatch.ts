import char from "../scanner/char";
import { TokenizerContext } from "./Token";

export function Dispatch(ctx: TokenizerContext) {
   const code = ctx.cursor.peek()


   switch (code) {
      case char.lessThan:

         break;
      case char.openBrace:
         
         break;
      default:
         break;
   }



}