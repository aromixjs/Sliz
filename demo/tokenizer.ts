import * as fs from "fs";
import { tokenize } from "../src/tokenizer/tokenize";
import { CompilerContext, Diagnostic } from "../src/pipeline/context";
import { cases } from "./content";

let output = "";

for (const test of cases) {
   output += "\n" + "=".repeat(10) + "\n";
   output += `${test.name} ${cases.indexOf(test)} \n`;
   output += "expected: " + (test.expected ?? "unknown") + "\n";
   output += "=".repeat(10) + "\n";

   try {
      const diagnostics: Diagnostic[] = [];
      const context: CompilerContext = {
         fileName: `${test.name.replace(/\s+/g, "-")}.sliz`,
         source: test.source,
         diagnostics,
      };

      const tokens = tokenize(context);

      output += `Tokens (${tokens.length}):\n`;
      output += JSON.stringify(tokens, null, 2) + "\n";

      if (diagnostics.length) {
         output += "\nDIAGNOSTICS:\n";
         output += JSON.stringify(diagnostics, null, 2) + "\n";
      }
   } catch (error) {
      output += "\nTOKENIZER CRASH:\n";
      output += String(error) + "\n";
   }
}

fs.writeFileSync("tokenizer-output.txt", output);
console.log("Output written to tokenizer-output.txt");
