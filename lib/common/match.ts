import char from "./char";
import * as skip from './skip'

export function word(source: string, cursor: number, word: string): boolean {
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




//  Match <server> or </server>
export interface ServerTagMatcherInput {
   source: string,
   cursor: number,
   target: 'open' | 'close'
}
export function serverTag(input: ServerTagMatcherInput) {
   const { source, cursor, target } = input

   if (source.charCodeAt(cursor) !== char.lessThan) {
      return undefined;
   }

   let position = cursor + 1;
   position = skip.whiteSpace(source, position);

   if (target === 'close') {
      if (source.charCodeAt(position) !== char.slash) return undefined;
      position++;
      position = skip.whiteSpace(source, position);
   }

   if (!word(source, position, "server")) return undefined;
   position += "server".length;
   position = skip.whiteSpace(source, position);

   if (source.charCodeAt(position) !== char.greaterThan) return undefined;
   return position + 1;
}