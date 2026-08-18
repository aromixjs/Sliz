import { JsInterpolationResolver, JsInterpolationStatus } from "@/src";
import { describe, expect, it } from "vitest";

describe("closing brace (core behavior)", () => {
  it("closes an empty expression {}", () => {
    const result = new JsInterpolationResolver("{}").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.start).toBe(0);
    expect(result.end).toBe(2);
    expect(result.text).toBe("{}");
  });

  it("closes a simple identifier expression {a}", () => {
    const result = new JsInterpolationResolver("{a}").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{a}");
  });

  it("closes an arithmetic expression with surrounding whitespace", () => {
    const result = new JsInterpolationResolver("{ a + b }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ a + b }");
  });

  it('closes the originally-provided example {userId+ /*"name*/}', () => {
    const result = new JsInterpolationResolver('{userId+ /*"name*/}').resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe('{userId+ /*"name*/}');
  });

  it("closes an arrow function expression { a => b }", () => {
    const result = new JsInterpolationResolver("{ a => b }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ a => b }");
  });

  it("closes a comparison with spaces { a < b }", () => {
    const result = new JsInterpolationResolver("{ a < b }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ a < b }");
  });

  it("closes a <= comparison { a <= b }", () => {
    const result = new JsInterpolationResolver("{ a <= b }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ a <= b }");
  });

  it("stops scanning at the first } and ignores trailing text", () => {
    const result = new JsInterpolationResolver("{a} b").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.end).toBe(3);
    expect(result.text).toBe("{a}");
  });

  it("respects a non-zero start offset", () => {
    const result = new JsInterpolationResolver("x = {a}").resolve(4);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.start).toBe(4);
    expect(result.end).toBe(7);
    expect(result.text).toBe("{a}");
  });
});

describe("string literals", () => {
  it("closes a double-quoted string expression", () => {
    const result = new JsInterpolationResolver('{ "hello" }').resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe('{ "hello" }');
  });

  it("closes a single-quoted string expression", () => {
    const result = new JsInterpolationResolver("{ 'hello' }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ 'hello' }");
  });

  it("handles an escaped quote inside a double-quoted string", () => {
    const result = new JsInterpolationResolver('{ "a\\"b" }').resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe('{ "a\\"b" }');
  });

  it("handles an escaped quote inside a single-quoted string", () => {
    const result = new JsInterpolationResolver("{ 'it\\'s' }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ 'it\\'s' }");
  });

  it("handles a doubled backslash before the closing quote", () => {
    const result = new JsInterpolationResolver('{ "a\\\\" }').resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe('{ "a\\\\" }');
  });
});

describe("braces inside string literals", () => {
  it("keeps a } that lives inside the string as part of the span", () => {
    const result = new JsInterpolationResolver('{ "}" }').resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe('{ "}" }');
  });

  it("emits UnterminatedLiteral when the closing quote is missing", () => {
    const result = new JsInterpolationResolver('{ "abc }').resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.UnterminatedLiteral);
    expect(result.text).toBe('{ "abc }');
  });

  it("terminates a string at a literal newline (malformed input, graceful)", () => {
    const result = new JsInterpolationResolver('{ "abc\ndef" }').resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.UnterminatedLiteral);
    expect(result.text.startsWith('{ "abc')).toBe(true);
  });
});

describe("template literals", () => {
  it("closes a plain template literal", () => {
    const result = new JsInterpolationResolver("{ `hi` }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ `hi` }");
  });

  it("closes a template literal that spans a newline", () => {
    const result = new JsInterpolationResolver("{ `a\nb` }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ `a\nb` }");
  });

  it("keeps an escaped backtick inside a template literal", () => {
    const result = new JsInterpolationResolver("{ `a\\`b` }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ `a\\`b` }");
  });

  it("captures the whole template (including ${...}) as one span", () => {
    const result = new JsInterpolationResolver("{ `a${b}c` }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ `a${b}c` }");
  });

  it("resolves a nested interpolation object literal inside a template", () => {
    const result = new JsInterpolationResolver("{ `x${ {y: 1} }z` }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ `x${ {y: 1} }z` }");
  });

  it("emits UnterminatedLiteral when the backtick is missing", () => {
    const result = new JsInterpolationResolver("{ `abc }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.UnterminatedLiteral);
    expect(result.text).toBe("{ `abc }");
  });

  it("emits an unterminated outcome for an unclosed template interpolation", () => {
    const result = new JsInterpolationResolver("{ `x${ y `").resolve(0);
    expect(result.status).not.toBe(JsInterpolationStatus.Closed);
  });
});

describe("comments", () => {
  it("closes after a line comment", () => {
    const result = new JsInterpolationResolver("{ a // note\n b }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ a // note\n b }");
  });

  it("closes after a block comment", () => {
    const result = new JsInterpolationResolver("{ /* c */ }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ /* c */ }");
  });

  it("does not let a } inside a block comment terminate the expression", () => {
    const result = new JsInterpolationResolver("{ /* } */ x }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ /* } */ x }");
  });

  it("emits UnterminatedEof when the block comment is never closed", () => {
    const result = new JsInterpolationResolver("{ /* c }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.UnterminatedEof);
    expect(result.text).toBe("{ /* c }");
  });

  it("does not treat a line comment as extending past the newline", () => {
    const result = new JsInterpolationResolver("{ a // note\n b }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ a // note\n b }");
  });
});

describe("nested braces", () => {
  it("closes a nested object literal { { a: 1 } }", () => {
    const result = new JsInterpolationResolver("{ { a: 1 } }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.end).toBe(12);
    expect(result.text).toBe("{ { a: 1 } }");
  });

  it("closes deeply nested braces { { { x } } }", () => {
    const result = new JsInterpolationResolver("{ { { x } } }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.end).toBe(13);
    expect(result.text).toBe("{ { { x } } }");
  });

  it("closes a nested group inside a template interpolation", () => {
    const result = new JsInterpolationResolver("{ `a${ (b) }c` }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ `a${ (b) }c` }");
  });
});

describe("regex / division disambiguation", () => {
  it("treats / as division (not regex) when not after a regex-triggering token", () => {
    const result = new JsInterpolationResolver("{ a / b }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ a / b }");
  });

  it("re-lexes / as a regex after return and ignores } inside the regex body", () => {
    const result = new JsInterpolationResolver("{ return /}/ }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ return /}/ }");
  });

  it("re-lexes / as a regex after = and ignores } inside the regex body", () => {
    const result = new JsInterpolationResolver("{ x = /}/ }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ x = /}/ }");
  });

  it("treats a regex with flags and quantifiers as a single span", () => {
    const result = new JsInterpolationResolver("{ return /[a-z]+/gim }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ return /[a-z]+/gim }");
  });

  it("emits UnterminatedLiteral for an unclosed regex after =", () => {
    const result = new JsInterpolationResolver("{ x = /abc }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.UnterminatedLiteral);
    expect(result.text).toBe("{ x = /abc");
  });

  it("emits UnterminatedLiteral for an unclosed regex after return", () => {
    const result = new JsInterpolationResolver("{ return /abc }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.UnterminatedLiteral);
    expect(result.text).toBe("{ return /abc");
  });
});

describe("template interpolation depth", () => {
  it("closes a template with multiple interpolations", () => {
    const result = new JsInterpolationResolver("{ `a${b}c${d}e` }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ `a${b}c${d}e` }");
  });

  it("closes a nested template literal inside an interpolation", () => {
    const result = new JsInterpolationResolver("{ `outer${ `inner${x}` }` }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ `outer${ `inner${x}` }` }");
  });

  it("keeps a } inside a plain template literal (no ${) as literal content", () => {
    const result = new JsInterpolationResolver("{ `a}b` }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ `a}b` }");
  });

  it("keeps a } inside a double-quoted string as literal content", () => {
    const result = new JsInterpolationResolver('{ "a}b" }').resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe('{ "a}b" }');
  });
});

describe("deep nesting / scale", () => {
  it("closes 200 levels of nested braces", () => {
    const source = "{".repeat(200) + "x" + "}".repeat(200);
    const result = new JsInterpolationResolver(source).resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.end).toBe(source.length);
    expect(result.text).toBe(source);
  });

  it("closes 200 levels of nested template interpolations", () => {
    const prefix = "`a${".repeat(200);
    const suffix = "}b`".repeat(200);
    const source = "{" + prefix + "x" + suffix + "}";
    const result = new JsInterpolationResolver(source).resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.end).toBe(source.length);
    expect(result.text).toBe(source);
  });
});

describe("malformed input / graceful degradation", () => {
  it("reports UnterminatedEof when no } is present", () => {
    const result = new JsInterpolationResolver("{ a + b").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.UnterminatedEof);
    expect(result.text).toBe("{ a + b");
  });
});

describe("whitespace handling", () => {
  it("closes an empty expression { }", () => {
    const result = new JsInterpolationResolver("{ }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ }");
  });

  it("closes a whitespace-only expression {   }", () => {
    const result = new JsInterpolationResolver("{   }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{   }");
  });

  it("stops at the first } for adjacent expressions {a}{b}", () => {
    const result = new JsInterpolationResolver("{a}{b}").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.end).toBe(3);
    expect(result.text).toBe("{a}");
  });

  it("keeps internal whitespace in the span { a - -b }", () => {
    const result = new JsInterpolationResolver("{ a - -b }").resolve(0);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ a - -b }");
  });
});

describe("guards", () => {
  it("returns UnterminatedEof for a negative start without throwing", () => {
    let thrown: unknown;
    let result: ReturnType<JsInterpolationResolver["resolve"]> | undefined;
    try {
      result = new JsInterpolationResolver("{a}").resolve(-2);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeUndefined();
    expect(result?.status).toBe(JsInterpolationStatus.UnterminatedEof);
    expect(result?.text).toBe("");
  });

  it("returns UnterminatedEof for a NaN start without throwing", () => {
    let thrown: unknown;
    let result: ReturnType<JsInterpolationResolver["resolve"]> | undefined;
    try {
      result = new JsInterpolationResolver("{a}").resolve(Number.NaN);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeUndefined();
    expect(result?.status).toBe(JsInterpolationStatus.UnterminatedEof);
  });

  it("returns UnterminatedEof for an out-of-range positive start without throwing", () => {
    let thrown: unknown;
    let result: ReturnType<JsInterpolationResolver["resolve"]> | undefined;
    try {
      result = new JsInterpolationResolver("{a}").resolve(99);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeUndefined();
    expect(result?.status).toBe(JsInterpolationStatus.UnterminatedEof);
  });

  it("does not throw when not positioned at {", () => {
    let thrown: unknown;
    try {
      new JsInterpolationResolver("userId+ /*name*/}").resolve(0);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeUndefined();
  });
});

describe("realistic multi-slot source with a single resolver instance", () => {
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

  const resolver = new JsInterpolationResolver(source);

  it("resolves the {kind} attribute expression slot", () => {
    const result = resolver.resolve(source.indexOf("{kind}"));
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{kind}");
  });

  it("resolves the {container} class expression slot", () => {
    const result = resolver.resolve(source.indexOf("{container}"));
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{container}");
  });

  it("resolves the {greeting + name} interpolation slot", () => {
    const result = resolver.resolve(source.indexOf("{greeting + name}"));
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{greeting + name}");
  });

  it("resolves the {ready} directive expression slot", () => {
    const result = resolver.resolve(source.indexOf("{ready}"));
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{ready}");
  });

  it("resolves the {submitLabel} slot", () => {
    const result = resolver.resolve(source.indexOf("{submitLabel}"));
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe("{submitLabel}");
  });

  it("resolves the .map expression with an embedded template literal", () => {
    const result = resolver.resolve(source.indexOf("{items.map"));
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toBe('{items.map((item) => `<li class="{row}">{item}</li>`)}');
  });

  it("keeps inner {row}/{item} inside the template literal (single span)", () => {
    const result = resolver.resolve(source.indexOf("{items.map"));
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.text).toContain("{row}");
    expect(result.text).toContain("{item}");
  });

  it("stops at the first } for an expression embedded in an attribute (card-{kind})", () => {
    const kindIndex = source.indexOf("{kind}");
    const result = resolver.resolve(kindIndex);
    expect(result.status).toBe(JsInterpolationStatus.Closed);
    expect(result.end).toBe(kindIndex + 6);
  });

  it("does not bleed state between slots on the shared instance", () => {
    resolver.resolve(source.indexOf("{kind}"));
    const afterContainer = resolver.resolve(source.indexOf("{container}"));
    expect(afterContainer.status).toBe(JsInterpolationStatus.Closed);
    expect(afterContainer.text).toBe("{container}");
  });

  it("scans every { in the source without throwing and degrades gracefully", () => {
    let searchFrom = 0;
    let position = source.indexOf("{", searchFrom);
    while (position !== -1) {
      const result = resolver.resolve(position);
      const isGraceful =
        result.status === JsInterpolationStatus.Closed ||
        result.status === JsInterpolationStatus.UnterminatedLiteral ||
        result.status === JsInterpolationStatus.UnterminatedEof;
      expect(isGraceful).toBe(true);
      searchFrom = position + 1;
      position = source.indexOf("{", searchFrom);
    }
  });
});
