import Char from "../Scanner/Char";
import { TokenizerContext } from "./Token";

export function Dispatch(Ctx: TokenizerContext) {
   const Code = Ctx.cursor.peek()


   switch (Code) {
      case Char.lessThan:

         break;
      case Char.openBrace:
         
         break;
      default:
         break;
   }



}
