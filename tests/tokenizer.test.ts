import { describe, expect, it } from "vitest";
import {
  HtmlChunkMatcher,
  ServerCodeMatcher,
  ServerEndMatcher,
  ServerStartMatcher,
} from "@lib/tokenizer/matchers";
import { Tokenizer } from "@lib/tokenizer/tokenizer";
import { SyntaxKind } from "@lib/tokenizer/types";

const {
  Unknown,
  EndOfFileToken,
  ServerStartToken,
  ServerEndToken,
  ServerCodeToken,
  HtmlToken,
} = SyntaxKind;

const tokenizer = new Tokenizer([
  new ServerStartMatcher(),
  new ServerCodeMatcher(),
  new ServerEndMatcher(),
  new HtmlChunkMatcher(),
]);

describe("tokenizer basics", () => {
  it("empty input yields only the EOF token", () => {
    expect(tokenizer.tokenize("")).toEqual([
      { kind: EndOfFileToken, start: 0, end: 0 },
    ]);
  });

  it("eof token carries the final cursor position", () => {
    const tokens = tokenizer.tokenize("abc");
    expect(tokens.at(-1)).toEqual({ kind: EndOfFileToken, start: 3, end: 3 });
  });

  it("plain html with no server block is one html chunk", () => {
    const src = "<div>hello</div>";
    expect(tokenizer.tokenize(src)).toEqual([
      { kind: HtmlToken, start: 0, end: 16, value: src },
      { kind: EndOfFileToken, start: 16, end: 16 },
    ]);
  });

  it("basic server block produces start/code/end tokens with positions", () => {
    const src = "<server>\nconst x = 1;\n</server>";
    expect(tokenizer.tokenize(src)).toEqual([
      { kind: ServerStartToken, start: 0, end: 8, value: "<server>" },
      { kind: ServerCodeToken, start: 8, end: 22, value: "\nconst x = 1;\n" },
      { kind: ServerEndToken, start: 22, end: 31, value: "</server>" },
      { kind: EndOfFileToken, start: 31, end: 31 },
    ]);
  });

  it("empty server block", () => {
    expect(tokenizer.tokenize("<server></server>").map((t) => t.kind)).toEqual([
      ServerStartToken,
      ServerEndToken,
      EndOfFileToken,
    ]);
  });

  it("whitespace-only server body is still server code", () => {
    const tokens = tokenizer.tokenize("<server>  \n </server>");
    expect(tokens[0].kind).toBe(ServerStartToken);
    expect(tokens[1]).toMatchObject({ kind: ServerCodeToken, value: "  \n " });
    expect(tokens[2].kind).toBe(ServerEndToken);
  });

  it("multiple server blocks separated by html", () => {
    const src = "<server>a</server><p>x</p><server>b</server>";
    expect(tokenizer.tokenize(src).map((t) => t.kind)).toEqual([
      ServerStartToken,
      ServerCodeToken,
      ServerEndToken,
      HtmlToken,
      ServerStartToken,
      ServerCodeToken,
      ServerEndToken,
      EndOfFileToken,
    ]);
  });

  it("html chunk stops exactly at a server start", () => {
    const tokens = tokenizer.tokenize("<div>a</div>\n<server>x</server>");
    expect(tokens.map((t) => t.kind)).toEqual([
      HtmlToken,
      ServerStartToken,
      ServerCodeToken,
      ServerEndToken,
      EndOfFileToken,
    ]);
    expect(tokens[0].value).toBe("<div>a</div>\n");
    expect(tokens[0].end).toBe(13);
  });
});

describe("tokenizer server code scanning", () => {
  it("handles double-quoted strings", () => {
    const src = `<server>"a\\"b"</server>`;
    expect(tokenizer.tokenize(src).map((t) => t.kind)).toEqual([
      ServerStartToken,
      ServerCodeToken,
      ServerEndToken,
      EndOfFileToken,
    ]);
  });

  it("handles single-quoted strings with escaped quote", () => {
    const src = `<server>'it\\'s'</server>`;
    expect(tokenizer.tokenize(src).map((t) => t.kind)).toEqual([
      ServerStartToken,
      ServerCodeToken,
      ServerEndToken,
      EndOfFileToken,
    ]);
  });

  it("does not treat </server> inside a string as the end", () => {
    const src = `<server>\nconst s = "</server>";\nconst y = 2;\n</server>`;
    const tokens = tokenizer.tokenize(src);
    expect(tokens.map((t) => t.kind)).toEqual([
      ServerStartToken,
      ServerCodeToken,
      ServerEndToken,
      EndOfFileToken,
    ]);
    expect(tokens[1].value).toContain("</server>");
  });

  it("handles backtick template literals", () => {
    const src = "<server>\nconst x = `data`;\n</server>";
    expect(tokenizer.tokenize(src).map((t) => t.kind)).toEqual([
      ServerStartToken,
      ServerCodeToken,
      ServerEndToken,
      EndOfFileToken,
    ]);
  });

  it("handles template literals with simple interpolation", () => {
    const src = "<server>\nconst x = `a${user.name}b`;\n</server>";
    const tokens = tokenizer.tokenize(src);
    expect(tokens.map((t) => t.kind)).toEqual([
      ServerStartToken,
      ServerCodeToken,
      ServerEndToken,
      EndOfFileToken,
    ]);
    expect(tokens[1].value).toContain("`a${user.name}b`");
  });

  it("handles nested template literals inside interpolation", () => {
    const src = "<server>\nconst a = `outer ${ `inner` } more`;\n</server>";
    const tokens = tokenizer.tokenize(src);
    expect(tokens.map((t) => t.kind)).toEqual([
      ServerStartToken,
      ServerCodeToken,
      ServerEndToken,
      EndOfFileToken,
    ]);
    expect(tokens[1].value).toContain("`outer ${ `inner` } more`");
  });

  it("handles nested template literal containing </server>", () => {
    const src = "<server>\nconst a = `outer ${ `inner</server>` } more`;\n</server>";
    const tokens = tokenizer.tokenize(src);
    expect(tokens.map((t) => t.kind)).toEqual([
      ServerStartToken,
      ServerCodeToken,
      ServerEndToken,
      EndOfFileToken,
    ]);
    expect(tokens[1].value).toContain("</server>");
  });

  it("handles interpolation with nested object braces", () => {
    const src = "<server>\nconst a = `x ${ { a: 1, b: [2, 3] } } y`;\n</server>";
    expect(tokenizer.tokenize(src).map((t) => t.kind)).toEqual([
      ServerStartToken,
      ServerCodeToken,
      ServerEndToken,
      EndOfFileToken,
    ]);
  });

  it("handles escaped backslash and backtick in templates", () => {
    const src = "<server>\nconst a = `a\\`b\\\\c`;\n</server>";
    const tokens = tokenizer.tokenize(src);
    expect(tokens.map((t) => t.kind)).toEqual([
      ServerStartToken,
      ServerCodeToken,
      ServerEndToken,
      EndOfFileToken,
    ]);
    expect(tokens[1].value).toContain("`a\\`b\\\\c`");
  });

  it("does not treat </server> inside a block comment as the end", () => {
    const src = "<server>\n/* </server> */\nconst z = 1;\n</server>";
    const tokens = tokenizer.tokenize(src);
    expect(tokens.map((t) => t.kind)).toEqual([
      ServerStartToken,
      ServerCodeToken,
      ServerEndToken,
      EndOfFileToken,
    ]);
    expect(tokens[1].value).toContain("/* </server> */");
  });

  it("does not treat </server> inside a line comment as the end", () => {
    const src = "<server>\n// </server>\nconst z = 1;\n</server>";
    expect(tokenizer.tokenize(src).map((t) => t.kind)).toEqual([
      ServerStartToken,
      ServerCodeToken,
      ServerEndToken,
      EndOfFileToken,
    ]);
  });

  it("handles a regex literal containing an escaped </server>", () => {
    const src = "<server>\nconst re = /<\\/server>/;\n</server>";
    const tokens = tokenizer.tokenize(src);
    expect(tokens.map((t) => t.kind)).toEqual([
      ServerStartToken,
      ServerCodeToken,
      ServerEndToken,
      EndOfFileToken,
    ]);
    expect(tokens[1].value).toContain("/<\\/server>/");
  });

  it("handles regex literals with character classes and flags", () => {
    const src = "<server>\nconst re = /[\\/\\]]+/gi;\n</server>";
    expect(tokenizer.tokenize(src).map((t) => t.kind)).toEqual([
      ServerStartToken,
      ServerCodeToken,
      ServerEndToken,
      EndOfFileToken,
    ]);
  });

  it("handles a regex literal right after an operator", () => {
    const src = "<server>\nconst f = (x) => x ? /a+/ : /b+/;\n</server>";
    expect(tokenizer.tokenize(src).map((t) => t.kind)).toEqual([
      ServerStartToken,
      ServerCodeToken,
      ServerEndToken,
      EndOfFileToken,
    ]);
  });

  it("does not mistake division for a regex and swallow the server end", () => {
    const src = "<server>\nconst x = a / b / c;\n</server>";
    const tokens = tokenizer.tokenize(src);
    expect(tokens.map((t) => t.kind)).toEqual([
      ServerStartToken,
      ServerCodeToken,
      ServerEndToken,
      EndOfFileToken,
    ]);
    expect(tokens[1].value).toContain("a / b / c");
  });

  it("does not mistake division on the next line for a regex", () => {
    const src = "<server>\nconst x = a\n/ b;\n</server>";
    expect(tokenizer.tokenize(src).map((t) => t.kind)).toEqual([
      ServerStartToken,
      ServerCodeToken,
      ServerEndToken,
      EndOfFileToken,
    ]);
  });

  it("handles regex at the very start of the body", () => {
    const src = "<server>\n/^start/m\n</server>";
    expect(tokenizer.tokenize(src).map((t) => t.kind)).toEqual([
      ServerStartToken,
      ServerCodeToken,
      ServerEndToken,
      EndOfFileToken,
    ]);
  });

  it("keeps trailing whitespace before the end tag in the code token", () => {
    const tokens = tokenizer.tokenize("<server>\nconst x = 1;\n\n   \n</server>");
    expect(tokens[1]).toMatchObject({
      kind: ServerCodeToken,
      value: "\nconst x = 1;\n\n   \n",
    });
    expect(tokens[2].value).toBe("</server>");
  });
});

describe("tokenizer server tag matching", () => {
  it.each([
    ["<server>", true],
    ["< server >", true],
    ["<server\t>", true],
    ["<server\n>", true],
    ["<Server>", false],
    ["<SERVER>", false],
    ["<serverx>", false],
    ["<serv>", false],
    ["<server", false],
  ])("%s -> %s", (open, isServer) => {
    const first = tokenizer.tokenize(open + "</server>")[0].kind;
    expect(first).toBe(isServer ? ServerStartToken : HtmlToken);
  });

  it.each(["</server>", "</ server>", "</server >", "</\tserver>"])(
    "recognizes %s as a server end",
    (close) => {
      expect(tokenizer.tokenize(`<server>x${close}`)[2].kind).toBe(
        ServerEndToken
      );
    }
  );

  it.each(["</serverx>", "</ser>", "</ serverx >", "</server"])(
    "does not treat %s as a server end (block continues)",
    (notClose) => {
      const tokens = tokenizer.tokenize(`<server>x${notClose}<div/></server>`);
      expect(tokens.map((t) => t.kind)).toEqual([
        ServerStartToken,
        ServerCodeToken,
        ServerEndToken,
        EndOfFileToken,
      ]);
      expect(tokens[1].value).toContain(notClose);
    }
  );

  it("a half-detected server tag falls back to Unknown + html chunk", () => {
    const tokens = tokenizer.tokenize("<server foo>abc");
    expect(tokens.map((t) => t.kind)).toEqual([
      Unknown,
      HtmlToken,
      EndOfFileToken,
    ]);
    expect(tokens[0].value).toBe("<");
    expect(tokens[1].value).toBe("server foo>abc");
  });

  it("does not treat an unterminated <server inside an attribute value as a start", () => {
    const src = '<div data-x="<serverx">y</div>';
    expect(tokenizer.tokenize(src).map((t) => t.kind)).toEqual([
      HtmlToken,
      EndOfFileToken,
    ]);
  });

  it("known limitation: a complete <server> inside an attribute value starts a server block", () => {
    const src = '<div title="<server>">x</div>';
    expect(tokenizer.tokenize(src).map((t) => t.kind)).toEqual([
      HtmlToken,
      ServerStartToken,
      ServerCodeToken,
      EndOfFileToken,
    ]);
  });

  it("does not treat a stray < as a server start", () => {
    const src = "a < b && c > d";
    expect(tokenizer.tokenize(src).map((t) => t.kind)).toEqual([
      HtmlToken,
      EndOfFileToken,
    ]);
  });
});

describe("tokenizer unknown characters", () => {
  it("emits Unknown for characters no matcher claims", () => {
    const tokens = tokenizer.tokenize("<server foo>x");
    expect(tokens[0].kind).toBe(Unknown);
    expect(tokens[0].value).toBe("<");
    expect(tokens[0]).toMatchObject({ start: 0, end: 1 });
  });
});

describe("tokenizer statefulness", () => {
  it("tokenize() calls are independent (mode is per call)", () => {
    const unterminated = tokenizer.tokenize("<server>\nconst x = 1;");
    expect(unterminated.map((t) => t.kind)).toEqual([
      ServerStartToken,
      ServerCodeToken,
      EndOfFileToken,
    ]);

    const fresh = tokenizer.tokenize("<div>hello</div>");
    expect(fresh.map((t) => t.kind)).toEqual([HtmlToken, EndOfFileToken]);
  });

  it("tokenizing the same input twice gives identical results", () => {
    const a = tokenizer.tokenize("<server>x</server>");
    const b = tokenizer.tokenize("<server>x</server>");
    expect(a).toEqual(b);
  });

  it("an unterminated server block still terminates with EOF", () => {
    expect(tokenizer.tokenize("<server>\nconst x = 1;").map((t) => t.kind)).toEqual(
      [ServerStartToken, ServerCodeToken, EndOfFileToken]
    );
  });

  it("html followed by unterminated server", () => {
    const kinds = tokenizer.tokenize("<p>a</p><server>x").map((t) => t.kind);
    expect(kinds).toEqual([
      HtmlToken,
      ServerStartToken,
      ServerCodeToken,
      EndOfFileToken,
    ]);
  });
});

describe("tokenizer html chunks", () => {
  it("html chunk with entities and attributes", () => {
    const src = '<a href="/x?y=1&amp;z=2" onclick="&lt;">&amp;text</a>';
    expect(tokenizer.tokenize(src).map((t) => t.kind)).toEqual([
      HtmlToken,
      EndOfFileToken,
    ]);
  });

  it("self closing html tags", () => {
    const src = "<br/><img src='x'/>";
    expect(tokenizer.tokenize(src).map((t) => t.kind)).toEqual([
      HtmlToken,
      EndOfFileToken,
    ]);
  });
});

describe("tokenizer integration", () => {
  it("splits a realistic aromix view", () => {
    const src = `<server>
const user = await getUser();
const data = await loadData();
</server>
<div .when={user}>
  Hello {user.name}
</div>`;
    const tokens = tokenizer.tokenize(src);
    expect(tokens.map((t) => t.kind)).toEqual([
      ServerStartToken,
      ServerCodeToken,
      ServerEndToken,
      HtmlToken,
      EndOfFileToken,
    ]);
    expect(tokens[1].value).toContain("await getUser()");
    expect(tokens[1].value).toContain("await loadData()");
    expect(tokens[3].value).toContain(".when={user}");
  });
});

describe("tokenizer properties", () => {
  it("tokens never overlap and cover the whole input", () => {
    const src =
      "<server>\nconst a=`x${y}`;\n/* */ /re/g\ntrue ? 1 : 2\n</server><p>tail</p>";
    const tokens = tokenizer.tokenize(src);
    let cursor = 0;
    for (const t of tokens.slice(0, -1)) {
      expect(t.start).toBe(cursor);
      expect(t.end).toBeGreaterThan(t.start);
      cursor = t.end;
    }
    expect(cursor).toBe(src.length);
    const eof = tokens.at(-1)!;
    expect(eof.start).toBe(cursor);
    expect(eof.end).toBe(cursor);
  });

  it("produces at least one token for any input", () => {
    for (const src of ["", "\n", "<", ">", "</", "<server>", "<server></server>"]) {
      expect(tokenizer.tokenize(src).length).toBeGreaterThan(0);
    }
  });

  it("terminates on nasty inputs (no infinite loop)", () => {
    const nasty = [
      "<",
      "<server",
      "<server>",
      "<server>\\",
      "<server>`",
      "<server>//",
      "<server>/*",
      "<server>/",
      "<server>/=",
      "<server>/g",
      "<server>${",
      "<server>`${`",
      "<server>\u0000",
      "<server>\n\0\0\0</server>",
      "\\".repeat(1000) + "</server>",
    ];
    for (const src of nasty) {
      const tokens = tokenizer.tokenize(src);
      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens.at(-1)!.kind).toBe(EndOfFileToken);
    }
  });
});
