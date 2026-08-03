import { Parser } from "../lib/parser/parser";
import {
  HtmlChunkMatcher,
  ServerCodeMatcher,
  ServerEndMatcher,
  ServerStartMatcher,
} from "../lib/tokenizer/matchers";
import { Tokenizer } from "../lib/tokenizer/tokenizer";

const tokenizer = new Tokenizer([
  new ServerStartMatcher(),
  new ServerCodeMatcher(),
  new ServerEndMatcher(),
  new HtmlChunkMatcher(),
]);

let failures = 0;
function report(name: string, passed: boolean, detail?: string) {
  console.log(`${passed ? "pass" : "FAIL"}  ${name}${detail ? ` (${detail})` : ""}`);
  if (!passed) failures++;
}

const tokenCases: { name: string; source: string }[] = [
  { name: "empty input", source: "" },
  { name: "100 server blocks in a row", source: "<server>x</server>".repeat(100) },
  {
    name: "an unterminated string swallows the rest of the input",
    source: `<server>\nconst s = "abc\nno end`,
  },
  {
    name: "an unterminated regex still finds the closing tag",
    source: `<server>\nconst r = /abc\n</server>`,
  },
  {
    name: "template literals nested three levels deep",
    source: "<server>\nconst a = `x${`y${`z`}y`}x`;\n</server>",
  },
  {
    name: "a block comment containing a closing tag",
    source: `<server>\n/* <div> </server> */\nok\n</server>`,
  },
  {
    name: "a regex with many flags",
    source: `<server>\nconst r = /a+\\/b+/gimuy;\n</server>`,
  },
  { name: "null bytes inside the server block", source: "<server>\u0000const x = 1;\u0000</server>" },
  { name: "html with entities only", source: "<a href='/x?a=1&amp;b=2'>&amp;&lt;</a>" },
  {
    name: "5000 lines of server code",
    source: "<server>\n" + "const a = 1;\n".repeat(5000) + "</server>",
  },
  { name: "binary garbage around a server block", source: "\u0000\u0001\u0002<server>\u0000</server>\u0000" },
];

for (const { name, source } of tokenCases) {
  const tokens = tokenizer.tokenize(source);
  const endsWithEof = tokens.at(-1)?.kind === "EndOfFileToken";
  report(`${name} -> ${tokens.length} tokens, ends with EOF`, endsWithEof);
}

{
  const source =
    "<server>\nconst a = `x${y}`;\n/* */ /re/g\ntrue ? 1 : 2\n</server><p>t</p>";
  const tokens = tokenizer.tokenize(source);
  let cursor = 0;
  let contiguous = true;
  for (const token of tokens.slice(0, -1)) {
    if (token.start !== cursor || token.end <= token.start) contiguous = false;
    cursor = token.end;
  }
  const coversInput = contiguous && cursor === source.length;
  report("every token starts where the previous one ended", coversInput);
}

{
  const tokens = tokenizer.tokenize(
    `<server>\nconst a = "not </server>";\nconst b = 'no </server>';\nconst c = \`no </server>\`;\nconst d = /no <\\/server>/;\n// no </server>\n/* no </server> */\nconst ok = 1;\n</server>`
  );
  const kinds = tokens.map((token) => token.kind);
  const endsAtServerEnd = kinds[kinds.length - 2] === "ServerEndToken";
  report("closing-tag lookalikes inside code do not split the block", endsAtServerEnd);
}

{
  tokenizer.tokenize(`<server>\nconst x = 1;`);
  const second = tokenizer.tokenize(`<div>hello</div>`);
  const kinds = second.map((token) => token.kind);
  const stateless = kinds.join(",") === "HtmlToken,EndOfFileToken";
  report("tokenizer has no state left over between inputs", stateless);
}

{
  const parser = new Parser();
  parser.write("");
  report("empty html parses to an empty tree", JSON.stringify(parser.end()) === "[]");
}

{
  const parser = new Parser();
  parser.write("<div>".repeat(500) + "deep" + "</div>".repeat(500));
  report("500 levels of nesting", parser.end().length === 1);
}

{
  const parser = new Parser();
  parser.write("<p>x</p>".repeat(10000));
  report("10000 sibling elements", parser.end().length === 10000);
}

{
  const parser = new Parser();
  parser.write("<div>one</div>");
  const first = parser.end();
  parser.reset();
  parser.write("<span>two</span>");
  const second = parser.end();
  const reusable =
    JSON.stringify(first).includes("div") && JSON.stringify(second).includes("span");
  report("reset() makes the parser reusable", reusable);
}

{
  const parser = new Parser();
  parser.write("<div class='a'>x</div>".repeat(100000));
  const start = Date.now();
  const nodes = parser.end();
  const elapsed = Date.now() - start;
  report("100000 elements parsed quickly", elapsed < 3000 && nodes.length === 100000, `${elapsed}ms`);
}

console.log(`\n${failures === 0 ? "all checks passed" : failures + " checks failed"}`);
process.exit(failures === 0 ? 0 : 1);
