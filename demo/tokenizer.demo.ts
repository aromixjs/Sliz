import {
  HtmlChunkMatcher,
  ServerCodeMatcher,
  ServerEndMatcher,
  ServerStartMatcher,
} from "../lib/tokenizer/matchers";
import { Tokenizer } from "../lib/tokenizer/tokenizer";
import { Token } from "../lib/tokenizer/types";

const tokenizer = new Tokenizer([
  new ServerStartMatcher(),
  new ServerCodeMatcher(),
  new ServerEndMatcher(),
  new HtmlChunkMatcher(),
]);

function printTokens(tokens: Token[]) {
  for (const token of tokens) {
    const value = (token.value ?? "")
      .replace(/\n/g, "\\n")
      .replace(/\t/g, "\\t");
    console.log(`  ${token.kind.padEnd(18)} [${token.start}..${token.end}]  ${value}`);
  }
}

function show(name: string, source: string) {
  console.log(`\n${name}\n${"-".repeat(name.length)}`);
  console.log(source);
  console.log();
  printTokens(tokenizer.tokenize(source));
}

show(
  "A view with a server block followed by markup",
  `<server>
const user = await getUser();
const name = "world";
</server>
<h1 .when={user}>Hello {user.name}</h1>`
);

show(
  "Server code that mentions </server> in strings, comments and regexes",
  `<server>
const msg = \`outer \${ \`inner\${user.id}\` } more\`;
const re = /<\\/server>/gi;
/* a comment mentioning </server> */
// a line comment mentioning </server>
</server>
<p>after</p>`
);

show(
  "Regexes, division and comments inside the server block",
  `<server>
const re = /[\\/\\]]+/gi;
const ratio = a / b / c;
const re2 = x ? /a+/ : /b+/;
</server>`
);

show(
  "An unterminated server block (no closing tag)",
  `<server>
const broken = "never closed
<p>still server code</p>`
);

tokenizer.tokenize(`<server>\nconst x = 1;`);
show(
  "The tokenizer is stateless: a fresh input after the unterminated block",
  `<div>fresh start</div>`
);
