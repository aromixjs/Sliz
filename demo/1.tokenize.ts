import { dir } from "console";
import { tokenize } from "../src/index";
import { readFileSync } from "fs";
import { join } from "path";


const content = readFileSync(

  join(import.meta.dirname, 't.html')

)

const context = {
  source: content.toString(),
  fileName: "test.sliz",
  diagnostics: [],
}

const result = tokenize(context);

dir({result, diagnostics:context.diagnostics}, { depth: null });
