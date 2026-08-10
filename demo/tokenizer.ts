import * as fs from "fs";
import { CompilerContext, Diagnostic } from "../src/pipeline/context";
import { tokenize } from "../src/tokenizer/tokenize";
import { cases } from "./content";

interface TestResult {
  name: string;
  expected: string;
  source: string;
  tokenCount: number;
  tokens: ReturnType<typeof tokenize>;
  diagnostics: Diagnostic[];
  error?: string;
}

const results: TestResult[] = [];

for (const test of cases) {
  const diagnostics: Diagnostic[] = [];
  const context: CompilerContext = {
    fileName: `${test.name.replace(/\s+/g, "-")}.sliz`,
    source: test.source,
    diagnostics: diagnostics,
  };

  let tokens: ReturnType<typeof tokenize> = [];
  let error: string | undefined;

  try {
    tokens = tokenize(context);
  } catch (err) {
    error = String(err);
  }

  results.push({
    name: test.name,
    expected: test.expected ?? "unknown",
    source: test.source,
    tokenCount: tokens.length,
    tokens,
    diagnostics,
    error,
  });
}

fs.writeFileSync("tokenizer-output.json", JSON.stringify(results, null, 2));

let crashCount = 0;
let diagnosticCount = 0;
let totalTokens = 0;

for (const r of results) {
  totalTokens += r.tokenCount;
  if (r.error) {
    crashCount++;
    console.log(`CRASH: ${r.name} - ${r.error}`);
  }
  if (r.diagnostics.length > 0) {
    diagnosticCount++;
  }
}

console.log(`Results: ${results.length} cases, ${totalTokens} total tokens, ${diagnosticCount} with diagnostics, ${crashCount} crashes`);
console.log("Output written to tokenizer-output.json");
