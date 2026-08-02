import { Char } from "./ascii.codes";

export class BaseMatcher {


   skipWhiteSpace(source: string, cursor: number) {
      while (cursor < source.length) {

         const code = source.charCodeAt(cursor)

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

      return cursor
   }

   matchWord(source: string, cursor: number, word: string) {
      for (let i = 0; i < word.length; i++) {
         if (source.charCodeAt(cursor + i) !== word.charCodeAt(i)) {
            return false;
         }

      }

      return true;
   }




}