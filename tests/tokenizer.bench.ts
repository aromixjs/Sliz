import { bench, describe } from "vitest";
import { Parser } from "htmlparser2";
import { tokenize } from "../src/tokenizer/tokenize";
import { CompilerContext, Diagnostic } from "../src/pipeline/context";
import { cases } from "../demo/content";

function buildLargeSource(): string {
  const parts: string[] = [];
  for (const test of cases) {
    parts.push(test.source);
  }
  const base = parts.join("\n\n");
  let src = "";
  while (src.length < 50000) {
    src += base + "\n\n";
  }
  return src.slice(0, 50000);
}

const source = buildLargeSource();

const noopHandler = {
  onopentagname() {},
  onopentag() {},
  onclosetag() {},
  ontext() {},
  oncomment() {},
  ondeclaration() {},
  onprocessinginstruction() {},
  onreset() {},
  onend() {},
  onError() {},
};

describe("tokenizer benchmark", () => {
  bench("htmlparser2 Parser", () => {
    const parser = new Parser(noopHandler, { decodeEntities: false });
    parser.write(source);
    parser.end();
  });

  bench("sliz tokenizer", () => {
    const diagnostics: Diagnostic[] = [];
    const ctx: CompilerContext = {
      fileName: "bench.sliz",
      source,
      diagnostics,
    };
    tokenize(ctx);
  });
});
