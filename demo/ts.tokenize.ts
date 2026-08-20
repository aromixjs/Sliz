import { baseParse } from "@vue/compiler-core";
import { readFile, readFileSync } from "fs";
import { join } from "path";

const data = readFileSync(join(import.meta.dirname, "Test.vue")).toString();

const output = baseParse(data);

console.dir(output, { depth: null });
