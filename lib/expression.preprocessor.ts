import char from "./common/char";
import { Token } from "./tokernizer";
import * as skip from './common/skip';
import { randomUUID } from "node:crypto";

export interface ExtractedExpression {
   id: string;
   source: string;
   start: number;
   end: number;
}

export interface PreProcessError {
   message: string;
   start: number;
}

export interface PreProcessResult {
   token: Token;
   expressions: Map<string, ExtractedExpression>;
   errors: PreProcessError[];
}

export function processExpressions(token: Token): PreProcessResult {
   const text = token.value || '';
   const expressions = new Map<string, ExtractedExpression>();
   const errors: PreProcessError[] = [];
   let position = 0
   let output = ''

   while (position < text.length) {
      const code = text.charCodeAt(position);

      if (code === char.openBrace) {
         const exprStart = position;
         const exprEnd = skip.braceExpression(text, exprStart + 1);
         const unterminated = text.charCodeAt(exprEnd - 1) !== char.closeBrace;
         if (unterminated) {
            errors.push({
               message: "Unterminated { expression — missing closing '}'",
               start: token.start + exprStart,
            });
         }
         const raw = text.slice(exprStart + 1, unterminated ? exprEnd : exprEnd - 1);
         const id = randomUUID();
         expressions.set(id, {
            id,
            source: raw,
            start: token.start + exprStart,
            end: token.start + exprEnd,
         });
         output += id
         position = exprEnd
         continue

      }



      output += text[position];
      position++;
   }

   return {
      token: {
         start: token.start,
         end: token.end,
         kind: token.kind,
         value: output
      },
      expressions,
      errors

   }
}
