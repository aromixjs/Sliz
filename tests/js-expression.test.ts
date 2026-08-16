import { Tokenizer } from "@/src";
import { describe, expect, it } from "vitest";
import * as acorn from 'acorn'
describe("Tokenize Html Tag", () => {
   it("Should Tokenize Basic Html Tag", () => {
      const expr = acorn.parseExpressionAt('{1+4}', 1, {
         ecmaVersion: 2022,
      });

      console.log(expr);
   });
});
