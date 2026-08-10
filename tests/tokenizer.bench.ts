import { bench, describe } from "vitest";
import { baseParse as vueParse } from "@vue/compiler-core";
import { Parser as htmlparser2 } from "htmlparser2";
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

const slizSource = buildLargeSource();

// Vue-compatible version: { expr } → {{ expr }}, <script server> → <script>, </script> → </script>
const vueSource = slizSource
  .replace(/\{([^{}]+)\}/g, "{{$1}}")
  .replace(/<script server[^>]*>/g, "<script>")
  .replace(/<\/script>/g, "</script>");

describe("tokenizer benchmark — similar workload", () => {
  bench("htmlparser2 Parser", () => {
    const parser = new htmlparser2(
      {
        onopentagname() { },
        onopentag() { },
        onclosetag() { },
        ontext() { },
        oncomment() { },
        onprocessinginstruction() { },
        onreset() { },
        onend() { },
      },
      { decodeEntities: false },
    );
    parser.write(slizSource);
    parser.end();
  });

  bench("vue compiler-baseParse", () => {
    vueParse(vueSource, { onError: () => { } });
  });

  bench("sliz tokenizer", () => {
    const diagnostics: Diagnostic[] = [];
    const ctx: CompilerContext = {
      fileName: "bench.sliz",
      source: slizSource,
      diagnostics,
    };
    tokenize(ctx);
  });
});
