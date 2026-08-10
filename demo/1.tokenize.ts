import { dir } from "console";
import { tokenize } from "../src/index";
import { readFileSync } from "fs";
import { join } from "path";


const content =readFileSync(

join(import.meta.dirname, 't.html')

)

const result = tokenize({
  source: content.toString(),
  fileName: "test.sliz",
  diagnostics: [],
});

dir(result, { depth: null });
