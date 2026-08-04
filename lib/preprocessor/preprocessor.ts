import { Char } from "@lib/tokenizer/codes";
import { Token } from "@lib/tokenizer/types";
import { ExtractedExpression, PreProcessError } from "./types";



const PLACEHOLDER_OPEN = "\uE000";  // Private-Use-Area sentinels — never
const PLACEHOLDER_CLOSE = "\uE001"; // occur in real source, inert to HTML
// entity decoding, and safe both inside quoted attribute values and in
// plain text content.

export function placeholderFor(id: string): string {
   return `${PLACEHOLDER_OPEN}${id}${PLACEHOLDER_CLOSE}`;
}



export class PreProcessor {
   readonly expressions = new Map<string, ExtractedExpression>()
   readonly errors: PreProcessError[] = [];
   private counter = 0;
   process<const T extends Token>(chunk: T): T {
      const text = chunk.value ?? "";
      let out = "";
      let i = 0;

      while (i < text.length) {
         const code = text.charCodeAt(i);

         if (code === Char.OpenBrace) {
            const exprStart = i;
            const { end, unterminated } = this.scanExpression(text, i);

            if (unterminated) {
               this.errors.push({
                  message: "Unterminated { expression — missing closing '}'",
                  start: chunk.start + exprStart,
               });
            }

            const raw = text.slice(exprStart + 1, unterminated ? end : end - 1);
            const id = `e${this.counter++}`;

            this.expressions.set(id, {
               id,
               source: raw,
               start: chunk.start + exprStart,
               end: chunk.start + end,
            });

            out += placeholderFor(id);
            i = end;
            continue;
         }

         out += text[i];
         i++;
      }

      return { ...chunk, value: out };
   }


   private scanExpression(
      text: string,
      start: number,
   ): { end: number; unterminated: boolean } {
      let depth = 0;
      let i = start;
      let quote: number | null = null;

      while (i < text.length) {
         const code = text.charCodeAt(i);

         if (quote !== null) {
            if (code === Char.Backslash) {
               i += 2;
               continue;
            }
            if (code === quote) quote = null;
            i++;
            continue;
         }

         if (code === Char.SingleQuote || code === Char.DoubleQuote || code === Char.Backtick) {
            quote = code;
            i++;
            continue;
         }

         if (code === Char.OpenBrace) {
            depth++;
            i++;
            continue;
         }
         if (code === Char.CloseBrace) {
            depth--;
            i++;
            if (depth === 0) return { end: i, unterminated: false };
            continue;
         }

         i++;
      }

      return { end: text.length, unterminated: true };
   }






}