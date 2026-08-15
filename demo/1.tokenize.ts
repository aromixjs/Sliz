import { dir } from "console";
import { tokenize } from "../src/index";
import { readFileSync } from "fs";
import { join } from "path";

const content = readFileSync(join(import.meta.dirname, "t.html"));

const result = tokenize(content.toString());

dir({ result }, { depth: null });
