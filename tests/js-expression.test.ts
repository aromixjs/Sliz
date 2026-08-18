import { JsExprTokenizer } from "@/src";
import { JsTokenType, RawJsToken } from "@/src/JsExpr/token";
import { describe, expect, it } from "vitest";

describe("closing brace (core behavior)", () => {
  it("closes an empty expression {}", () => {
    const result = new JsExprTokenizer("{}").tokenize(0);

    expect(result.closed).toBe(true);
    expect(result.tokens.map((token) => token.type)).toEqual([
      JsTokenType.ExpressionStart,
      JsTokenType.ExpressionEnd,
    ]);
  });

  it("closes a simple identifier expression {a}", () => {
    const result = new JsExprTokenizer("{a}").tokenize(0);
    expect(result.closed).toBe(true);
    expect(result.tokens.map((token) => token.type)).toEqual([
      JsTokenType.ExpressionStart,
      JsTokenType.RawJs,
      JsTokenType.ExpressionEnd,
    ]);
    const raw = result.tokens.find((token) => token.type === JsTokenType.RawJs) as {
      content: string;
    };
    expect(raw.content).toBe("a");
  });

  it("closes an arithmetic expression with surrounding whitespace", () => {
    const result = new JsExprTokenizer("{ a + b }").tokenize(0);
    expect(result.closed).toBe(true);
    const raw = result.tokens.find((token) => token.type === JsTokenType.RawJs) as {
      content: string;
    };
    expect(raw.content).toBe("a + b");
  });

  it('closes the originally-provided example {userId+ /*"name*/}', () => {
    const result = new JsExprTokenizer('{userId+ /*"name*/}').tokenize(0);
    expect(result.closed).toBe(true);
    expect(result.tokens.map((token) => token.type)).toEqual([
      JsTokenType.ExpressionStart,
      JsTokenType.RawJs,
      JsTokenType.BlockComment,
      JsTokenType.ExpressionEnd,
    ]);
    const raw = result.tokens.find((token) => token.type === JsTokenType.RawJs) as {
      content: string;
    };
    expect(raw.content).toBe("userId+");
    const comment = result.tokens.find((token) => token.type === JsTokenType.BlockComment) as {
      content: string;
    };
    expect(comment.content).toBe('/*"name*/');
  });

  it("closes an arrow function expression { a => b }", () => {
    const result = new JsExprTokenizer("{ a => b }").tokenize(0);
    expect(result.closed).toBe(true);
    const raw = result.tokens.find((token) => token.type === JsTokenType.RawJs) as {
      content: string;
    };
    expect(raw.content).toBe("a => b");
  });

  it("closes a comparison with spaces { a < b }", () => {
    const result = new JsExprTokenizer("{ a < b }").tokenize(0);
    expect(result.closed).toBe(true);
    const raw = result.tokens.find((token) => token.type === JsTokenType.RawJs) as {
      content: string;
    };
    expect(raw.content).toBe("a < b");
  });

  it("closes a <= comparison { a <= b }", () => {
    const result = new JsExprTokenizer("{ a <= b }").tokenize(0);
    expect(result.closed).toBe(true);
    const raw = result.tokens.find((token) => token.type === JsTokenType.RawJs) as {
      content: string;
    };
    expect(raw.content).toBe("a <= b");
  });

  it("stops scanning at the first } and ignores trailing text", () => {
    const result = new JsExprTokenizer("{a} b").tokenize(0);
    expect(result.closed).toBe(true);
    expect(result.end).toBe(3);
  });

  it("respects a non-zero start offset", () => {
    const result = new JsExprTokenizer("x = {a}").tokenize(4);
    expect(result.closed).toBe(true);
    const raw = result.tokens.find((token) => token.type === JsTokenType.RawJs) as {
      content: string;
    };
    expect(raw.content).toBe("a");
  });
});

describe("string literals", () => {
  it("closes a double-quoted string expression", () => {
    const result = new JsExprTokenizer('{ "hello" }').tokenize(0);
    expect(result.closed).toBe(true);
    const str = result.tokens.find((token) => token.type === JsTokenType.StringLiteral) as {
      content: string;
    };
    expect(str.content).toBe('"hello"');
  });

  it("closes a single-quoted string expression", () => {
    const result = new JsExprTokenizer("{ 'hello' }").tokenize(0);
    expect(result.closed).toBe(true);
    const str = result.tokens.find((token) => token.type === JsTokenType.StringLiteral) as {
      content: string;
    };
    expect(str.content).toBe("'hello'");
  });

  it("handles an escaped quote inside a double-quoted string", () => {
    const result = new JsExprTokenizer('{ "a\\"b" }').tokenize(0);
    expect(result.closed).toBe(true);
    const str = result.tokens.find((token) => token.type === JsTokenType.StringLiteral) as {
      content: string;
    };
    expect(str.content).toBe('"a\\"b"');
  });

  it("handles an escaped quote inside a single-quoted string", () => {
    const result = new JsExprTokenizer("{ 'it\\'s' }").tokenize(0);
    expect(result.closed).toBe(true);
    const str = result.tokens.find((token) => token.type === JsTokenType.StringLiteral) as {
      content: string;
    };
    expect(str.content).toBe("'it\\'s'");
  });

  it("handles a doubled backslash before the closing quote", () => {
    const result = new JsExprTokenizer('{ "a\\\\" }').tokenize(0);
    expect(result.closed).toBe(true);
    const str = result.tokens.find((token) => token.type === JsTokenType.StringLiteral) as {
      content: string;
    };
    expect(str.content).toBe('"a\\\\"');
  });

  it("keeps a } that lives inside the string as string content", () => {
    const result = new JsExprTokenizer('{ "}" }').tokenize(0);
    expect(result.closed).toBe(true);
    const str = result.tokens.find((token) => token.type === JsTokenType.StringLiteral) as {
      content: string;
    };
    expect(str.content).toBe('"}"');
  });

  it("emits UnterminatedString when the closing quote is missing", () => {
    const result = new JsExprTokenizer('{ "abc }').tokenize(0);
    expect(result.closed).toBe(false);
    const str = result.tokens.find((token) => token.type === JsTokenType.UnterminatedString) as {
      content: string;
    };
    expect(str.content).toBe('"abc }');
    expect(result.tokens.some((token) => token.type === JsTokenType.UnterminatedExpression)).toBe(
      true,
    );
  });

  it("terminates a string at a literal newline (malformed input, graceful)", () => {
    const result = new JsExprTokenizer('{ "abc\ndef" }').tokenize(0);
    expect(result.closed).toBe(false);
    const str = result.tokens.find((token) => token.type === JsTokenType.UnterminatedString) as {
      content: string;
    };
    expect(str.content.startsWith('"abc')).toBe(true);
  });
});

describe("template literals", () => {
  it("closes a plain template literal", () => {
    const result = new JsExprTokenizer("{ `hi` }").tokenize(0);
    expect(result.closed).toBe(true);
    const template = result.tokens.find((token) => token.type === JsTokenType.TemplateLiteral) as {
      content: string;
    };
    expect(template.content).toBe("`hi`");
  });

  it("closes a template literal that spans a newline", () => {
    const result = new JsExprTokenizer("{ `a\nb` }").tokenize(0);
    expect(result.closed).toBe(true);
    const template = result.tokens.find((token) => token.type === JsTokenType.TemplateLiteral) as {
      content: string;
    };
    expect(template.content).toBe("`a\nb`");
  });

  it("keeps an escaped backtick inside a template literal", () => {
    const result = new JsExprTokenizer("{ `a\\`b` }").tokenize(0);
    expect(result.closed).toBe(true);
    const template = result.tokens.find((token) => token.type === JsTokenType.TemplateLiteral) as {
      content: string;
    };
    expect(template.content).toBe("`a\\`b`");
  });

  it("captures the whole template (including ${...}) as one TemplateLiteral token", () => {
    const result = new JsExprTokenizer("{ `a${b}c` }").tokenize(0);
    expect(result.closed).toBe(true);
    const found = result.tokens.find((token) => token.type === JsTokenType.TemplateLiteral) as {
      content: string;
    };
    expect(found.content).toBe("`a${b}c`");
  });

  it("resolves a nested interpolation object literal inside a template", () => {
    const result = new JsExprTokenizer("{ `x${ {y: 1} }z` }").tokenize(0);
    expect(result.closed).toBe(true);
    const found = result.tokens.find((token) => token.type === JsTokenType.TemplateLiteral) as {
      content: string;
    };
    expect(found.content).toBe("`x${ {y: 1} }z`");
  });

  it("emits UnterminatedTemplateLiteral when the backtick is missing", () => {
    const result = new JsExprTokenizer("{ `abc }").tokenize(0);
    expect(result.closed).toBe(false);
    const found = result.tokens.find(
      (token) => token.type === JsTokenType.UnterminatedTemplateLiteral,
    ) as { content: string };
    expect(found.content).toBe("`abc }");
  });

  it("emits UnterminatedExpression for an unclosed interpolation (inner and outer)", () => {
    const result = new JsExprTokenizer("{ `x${ y `").tokenize(0);
    const unterminated = result.tokens.filter(
      (token) => token.type === JsTokenType.UnterminatedExpression,
    );
    expect(unterminated.length).toBe(2);
  });
});

describe("comments", () => {
  it("closes after a line comment", () => {
    const result = new JsExprTokenizer("{ a // note\n b }").tokenize(0);
    expect(result.closed).toBe(true);
    const comment = result.tokens.find((token) => token.type === JsTokenType.LineComment) as {
      content: string;
    };
    expect(comment.content).toBe("// note");
    expect(result.tokens.some((token) => token.type === JsTokenType.ExpressionEnd)).toBe(true);
  });

  it("closes after a block comment", () => {
    const result = new JsExprTokenizer("{ /* c */ }").tokenize(0);
    expect(result.closed).toBe(true);
    const comment = result.tokens.find((token) => token.type === JsTokenType.BlockComment) as {
      content: string;
    };
    expect(comment.content).toBe("/* c */");
  });

  it("does not let a } inside a block comment terminate the expression", () => {
    const result = new JsExprTokenizer("{ /* } */ x }").tokenize(0);
    expect(result.closed).toBe(true);
    const comment = result.tokens.find((token) => token.type === JsTokenType.BlockComment) as {
      content: string;
    };
    expect(comment.content).toBe("/* } */");
    expect(result.tokens.some((token) => token.type === JsTokenType.ExpressionEnd)).toBe(true);
  });

  it("emits UnterminatedBlockComment when the block comment is never closed", () => {
    const result = new JsExprTokenizer("{ /* c }").tokenize(0);
    expect(result.closed).toBe(false);
    const comment = result.tokens.find(
      (token) => token.type === JsTokenType.UnterminatedBlockComment,
    ) as { content: string };
    expect(comment.content).toBe("/* c }");
  });

  it("does not treat a line comment as extending past the newline", () => {
    const result = new JsExprTokenizer("{ a // note\n b }").tokenize(0);
    const comment = result.tokens.find((token) => token.type === JsTokenType.LineComment) as {
      content: string;
    };
    expect(comment.content.includes("\n")).toBe(false);
  });
});

describe("nested braces", () => {
  it("closes a nested object literal { { a: 1 } }", () => {
    const result = new JsExprTokenizer("{ { a: 1 } }").tokenize(0);
    expect(result.closed).toBe(true);
    const endCount = result.tokens.filter(
      (token) => token.type === JsTokenType.ExpressionEnd,
    ).length;
    expect(endCount).toBe(2);
  });

  it("closes deeply nested braces { { { x } } }", () => {
    const result = new JsExprTokenizer("{ { { x } } }").tokenize(0);
    expect(result.closed).toBe(true);
    const endCount = result.tokens.filter(
      (token) => token.type === JsTokenType.ExpressionEnd,
    ).length;
    expect(endCount).toBe(3);
  });

  it("closes a nested group inside a template interpolation", () => {
    const result = new JsExprTokenizer("{ `a${ (b) }c` }").tokenize(0);
    expect(result.closed).toBe(true);
    const found = result.tokens.find((token) => token.type === JsTokenType.TemplateLiteral) as {
      content: string;
    };
    expect(found.content).toBe("`a${ (b) }c`");
  });
});

describe("html tag-like boundaries", () => {
  it("should treat <div as TagLike and stop scanning", () => {
    const result = new JsExprTokenizer("{ <div }").tokenize(0);
    expect(result.tokens.some((token) => token.type === JsTokenType.TagLike)).toBe(true);
    expect(result.closed).toBe(false);
  });

  it("should treat </div as TagLike and stop scanning", () => {
    const result = new JsExprTokenizer("{ </div> }").tokenize(0);
    expect(result.tokens.some((token) => token.type === JsTokenType.TagLike)).toBe(true);
    expect(result.closed).toBe(false);
  });

  it("flags <identifier adjacency as TagLike (ambiguous JS comparison)", () => {
    const result = new JsExprTokenizer("{ a <b }").tokenize(0);
    expect(result.tokens.some((token) => token.type === JsTokenType.TagLike)).toBe(true);
  });

  it("does not flag < followed by a space as TagLike", () => {
    const result = new JsExprTokenizer("{ a < b }").tokenize(0);
    expect(result.tokens.some((token) => token.type === JsTokenType.TagLike)).toBe(false);
    expect(result.closed).toBe(true);
  });
});

describe("malformed input / graceful degradation", () => {
  it("reports an unterminated expression when no } is present", () => {
    const result = new JsExprTokenizer("{ a + b").tokenize(0);
    expect(result.closed).toBe(false);
    expect(result.tokens.some((token) => token.type === JsTokenType.UnterminatedExpression)).toBe(
      true,
    );
  });
});

describe("whitespace handling", () => {
  it("does not emit a RawJs token for { }", () => {
    const result = new JsExprTokenizer("{ }").tokenize(0);
    expect(result.closed).toBe(true);
    expect(result.tokens.some((token) => token.type === JsTokenType.RawJs)).toBe(false);
  });

  it("does not emit a RawJs token for {   }", () => {
    const result = new JsExprTokenizer("{   }").tokenize(0);
    expect(result.tokens.some((token) => token.type === JsTokenType.RawJs)).toBe(false);
  });

  it("does not emit an empty RawJs between adjacent tokens", () => {
    const result = new JsExprTokenizer("{a}{b}").tokenize(0);
    const raws = result.tokens.filter((token) => token.type === JsTokenType.RawJs);
    expect(raws.length).toBe(1);
    const raw = raws[0] as { content: string };
    expect(raw.content).toBe("a");
  });

  it("trims surrounding whitespace but keeps internal whitespace", () => {
    const result = new JsExprTokenizer("{ a - -b }").tokenize(0);
    const raw = result.tokens.find((token) => token.type === JsTokenType.RawJs) as {
      content: string;
    };
    expect(raw.content).toBe("a - -b");
  });
});

describe("guards", () => {
  it("throws a safe Error (not RangeError) for an out-of-range start", () => {
    let thrown: unknown;
    try {
      new JsExprTokenizer("{a}").tokenize(99);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(Error);
    expect(thrown).not.toBeInstanceOf(RangeError);
    expect((thrown as Error).message).toContain("index");
  });

  it("throws a safe Error when not positioned at {", () => {
    let thrown: unknown;
    try {
      new JsExprTokenizer("userId+ /*name*/}").tokenize(0);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).toContain("'{'");
  });
});

describe("realistic multi-slot source with a single tokenizer instance", () => {
  const source =
    "<script server>\n" +
    '  const name = "world";\n' +
    "  const items = [1, 2, 3];\n" +
    "  const ready = true;\n" +
    '  const kind = "primary";\n' +
    "</script>\n\n" +
    '<div class="card-{kind}">\n' +
    '  <main class="{container}">\n' +
    "    <h1>{greeting + name}</h1>\n" +
    "    <ul>\n" +
    '      {items.map((item) => `<li class="{row}">{item}</li>`)}\n' +
    "    </ul>\n" +
    '    <button .when="{ready}">{submitLabel}</button>\n' +
    "  </main>\n" +
    "</div>";

  const tokenizer = new JsExprTokenizer(source);

  it("tokenizes the {kind} attribute expression slot", () => {
    const result = tokenizer.tokenize(source.indexOf("{kind}"));
    expect(result.closed).toBe(true);
    const raw = result.tokens.find((token) => token.type === JsTokenType.RawJs) as RawJsToken;
    expect(raw.content).toBe("kind");
  });

  it("tokenizes the {container} class expression slot", () => {
    const result = tokenizer.tokenize(source.indexOf("{container}"));
    expect(result.closed).toBe(true);
    const raw = result.tokens.find((token) => token.type === JsTokenType.RawJs) as RawJsToken;
    expect(raw.content).toBe("container");
  });

  it("tokenizes the {greeting + name} interpolation slot", () => {
    const result = tokenizer.tokenize(source.indexOf("{greeting + name}"));
    expect(result.closed).toBe(true);
    const raw = result.tokens.find((token) => token.type === JsTokenType.RawJs) as RawJsToken;
    expect(raw.content).toBe("greeting + name");
  });

  it("tokenizes the {ready} directive expression slot", () => {
    const result = tokenizer.tokenize(source.indexOf("{ready}"));
    expect(result.closed).toBe(true);
    const raw = result.tokens.find((token) => token.type === JsTokenType.RawJs) as RawJsToken;
    expect(raw.content).toBe("ready");
  });

  it("tokenizes the {submitLabel} slot", () => {
    const result = tokenizer.tokenize(source.indexOf("{submitLabel}"));
    expect(result.closed).toBe(true);
    const raw = result.tokens.find((token) => token.type === JsTokenType.RawJs) as RawJsToken;
    expect(raw.content).toBe("submitLabel");
  });

  it("tokenizes the .map expression with an embedded template literal", () => {
    const result = tokenizer.tokenize(source.indexOf("{items.map"));
    expect(result.closed).toBe(true);
    const raws = result.tokens.filter((token) => token.type === JsTokenType.RawJs) as RawJsToken[];
    expect(raws[0].content).toBe("items.map((item) =>");
    expect(raws[raws.length - 1].content).toBe(")");
    const template = result.tokens.find((token) => token.type === JsTokenType.TemplateLiteral) as {
      content: string;
    };
    expect(template.content).toBe('`<li class="{row}">{item}</li>`');
  });

  it("keeps inner {row}/{item} inside the template literal (single ExpressionStart)", () => {
    const result = tokenizer.tokenize(source.indexOf("{items.map"));
    const startCount = result.tokens.filter(
      (token) => token.type === JsTokenType.ExpressionStart,
    ).length;
    expect(startCount).toBe(1);
    const template = result.tokens.find((token) => token.type === JsTokenType.TemplateLiteral) as {
      content: string;
    };
    expect(template.content).toContain("{row}");
    expect(template.content).toContain("{item}");
  });

  it("stops at the first } for an expression embedded in an attribute (card-{kind})", () => {
    const result = tokenizer.tokenize(source.indexOf("{kind}"));
    expect(result.closed).toBe(true);
    expect(result.end).toBe(source.indexOf("{kind}") + 6);
  });

  it("does not bleed state between slots on the shared instance", () => {
    tokenizer.tokenize(source.indexOf("{kind}"));
    const afterContainer = tokenizer.tokenize(source.indexOf("{container}"));
    const hasKind = afterContainer.tokens.some(
      (token) => "content" in token && (token as { content: string }).content.includes("kind"),
    );
    expect(hasKind).toBe(false);
    expect(afterContainer.closed).toBe(true);
  });

  it("scans every { in the source without throwing and degrades gracefully", () => {
    let searchFrom = 0;
    let position = source.indexOf("{", searchFrom);
    while (position !== -1) {
      const result = tokenizer.tokenize(position);
      const isGraceful =
        result.closed ||
        result.tokens.some((token) => token.type === JsTokenType.UnterminatedExpression);
      expect(isGraceful).toBe(true);
      searchFrom = position + 1;
      position = source.indexOf("{", searchFrom);
    }
  });
});
