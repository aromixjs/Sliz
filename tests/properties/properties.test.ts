import { SyntaxKind, tokenize } from "@/src";
import * as fc from "fast-check";
import { describe, expect, it } from "vitest";

// ===========================================================================
// Arbitraries — input generators designed to stress every code path
// ===========================================================================

const ASCII_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>{}=\"/\\'!@#$%^&*()_-+|[];:,.?~` \t\n\r";

const CRITICAL_CHARS = [
   "<", ">", "{", "}", "/", '"', "'", "=", "!", "-", "\\", "\0", "\n", "\r",
   "\t", "#", "@", "$", "%", "^", "&", "*", "(", ")", "[", "]", ";", ":",
   ",", ".", "?", "~", "|", "+", "_", "=", "`",
];

const HTML_FRAGMENTS = [
   "", "<div>", "</div>", "<span>", "</span>", "<p>", "</p>",
   "<br>", "<br/>", "<hr>", "<img>",
   "<!-- comment -->", "<!--", "-->", "<!-", "<!",
   "<!DOCTYPE html>", "<!DOCTYPE", "<!do", "<!DOC",
   "<script>", "</script>", "<style>", "</style>",
   "<>", "</>", "<<", ">>",
   "<Component />", "<Component/>",
];

const JS_FRAGMENTS = [
   "{x}", "{a + b}", "{a < b}", "{a > b}", "{a && b}",
   "{a || b}", "{a ? b : c}", "{() => x}", "{function(){}}",
   "{}", "{}}", "{{}", "{a{b}c}",
   '{"str"}', "{'str'}", '{"a}b"}', "{a'}",
   "{{}}", "{a}", "{}",
];

const CSS_FRAGMENTS = [
   ".a{}", ".a{color:red}", ".a{.b{}}", "@media{}",
   "/* comment */", ".a{content:\"\"}",
];

const ATTR_FRAGMENTS = [
   'class="x"', "class='x'", "class={x}", "class=",
   "id=\"y\"", "disabled", "data-x=\"z\"",
   "class=\"\"", "class=''", "class={}", "class={a > b}",
];

const VALID_TEMPLATES = [
   '<div class="test">hello</div>',
   '<div class={expr}>content</div>',
   '<script>var x = 1;</script>',
   "<style>.a{color:red}</style>",
   "<!-- comment -->",
   "<!DOCTYPE html>",
   "<div><span>{x}</span></div>",
   "<Component prop={value} />",
   "<div class={a > b}>text</div>",
   '<div class={a || b} id={c}>x</div>',
   "<div>text</div>",
   "<br/>",
   "<img />",
   "<div class=\"a b c\">x</div>",
   "<div class='a b c'>x</div>",
   "<div disabled>",
   '<input type="text" />',
   "<div>{a + b}</div>",
   "<div>{a ? b : c}</div>",
   "<div><!-- html comment --></div>",
   "<script>if(a<b){}</script>",
   "<style>.a{color:red; font-size:12px}</style>",
];

// -- Generators --

/** Pure random ASCII strings up to 500 chars. */
const arbitraryAscii = fc.string({
   unit: fc.constantFrom(...ASCII_CHARS),
   minLength: 0,
   maxLength: 500,
});

/** Assemble valid HTML fragments randomly. */
const arbitraryHtmlDoc = fc.array(
   fc.constantFrom(...HTML_FRAGMENTS, ...JS_FRAGMENTS, ...CSS_FRAGMENTS, ...ATTR_FRAGMENTS),
   { minLength: 0, maxLength: 20 },
).map(parts => parts.join(""));

/** Start from a valid template and apply random mutations. */
const arbitraryMutated = fc.constantFrom(...VALID_TEMPLATES).map(template => {
   let s = template;
   const n = Math.floor(Math.random() * 8) + 1;
   for (let i = 0; i < n; i++) {
      const r = Math.random();
      const pool = ASCII_CHARS;
      if (r < 0.15 && s.length > 0) {
         const p = Math.floor(Math.random() * s.length);
         s = s.slice(0, p) + s.slice(p + 1);
      } else if (r < 0.30) {
         const p = Math.floor(Math.random() * (s.length + 1));
         s = s.slice(0, p) + pool[Math.floor(Math.random() * pool.length)] + s.slice(p);
      } else if (r < 0.45 && s.length > 0) {
         const p = Math.floor(Math.random() * s.length);
         s = s.slice(0, p) + pool[Math.floor(Math.random() * pool.length)] + s.slice(p + 1);
      } else if (r < 0.60 && s.length > 1) {
         const p = Math.floor(Math.random() * (s.length - 1));
         s = s.slice(0, p) + s[p + 1] + s[p] + s.slice(p + 2);
      } else if (r < 0.70) {
         const p = Math.floor(Math.random() * (s.length + 1));
         const ch = CRITICAL_CHARS[Math.floor(Math.random() * CRITICAL_CHARS.length)];
         s = s.slice(0, p) + ch.repeat(Math.floor(Math.random() * 5) + 1) + s.slice(p);
      } else if (r < 0.80 && s.length > 0) {
         const p = Math.floor(Math.random() * s.length);
         const len = Math.min(3, s.length - p);
         const sub = s.slice(p, p + len);
         s = s.slice(0, p) + sub + sub + s.slice(p + len);
      } else {
         s += VALID_TEMPLATES[Math.floor(Math.random() * VALID_TEMPLATES.length)];
      }
   }
   return s.slice(0, 500);
});

/** Insert every critical char at every position in a base string. */
const arbitraryBoundary = fc.constantFrom(...VALID_TEMPLATES).map(base => {
   const inputs: string[] = [];
   for (const ch of CRITICAL_CHARS) {
      for (let pos = 0; pos <= Math.min(base.length, 30); pos++) {
         inputs.push(base.slice(0, pos) + ch + base.slice(pos));
      }
   }
   for (let pos = 0; pos <= Math.min(base.length, 30); pos++) {
      inputs.push(base.slice(0, pos));
   }
   return inputs;
}).map(arr => arr[Math.floor(Math.random() * arr.length)]);

/** Deeply nested structures that stress depth tracking. */
const arbitraryDeepNest = fc.integer({ min: 1, max: 50 }).map(depth => {
   const strategy = Math.random();
   if (strategy < 0.25) {
      return "{".repeat(depth) + "x" + "}".repeat(depth);
   } else if (strategy < 0.50) {
      let s = "";
      for (let i = 0; i < Math.min(depth, 20); i++) s += "<div>";
      s += "text";
      for (let i = 0; i < Math.min(depth, 20); i++) s += "</div>";
      return s;
   } else if (strategy < 0.75) {
      let s = "";
      for (let i = 0; i < Math.min(depth, 15); i++) s += "<div class={";
      s += "x";
      for (let i = 0; i < Math.min(depth, 15); i++) s += "}}";
      return s;
   } else {
      return "<".repeat(depth) + "div>";
   }
});

/** Repeated patterns that stress loop detection. */
const arbitraryRepetition = fc.tuple(
   fc.constantFrom(
      "<", "</", "{", "}", "<>", "</>", "<!", "<!--",
      "<<", ">>", "/>", "<div ", "<div>", "</div>", "{x}",
      "{{", "}}", "<script>", "<style>", "</script>", "</style>",
      "class=", "id=", 'class="', "class='",
   ),
   fc.integer({ min: 2, max: 100 }),
).map(([pattern, count]) => pattern.repeat(count));

/** Control characters and unicode edge cases. */
const arbitraryUnicode = fc.oneof(
   fc.constant("\0"),
   fc.constant("\uFEFF"),
   fc.constant("\uFFFD"),
   fc.constant("\n"),
   fc.constant("\r"),
   fc.constant("\t"),
   fc.constantFrom(
      ...Array.from({ length: 32 }, (_, i) => String.fromCharCode(i)),
   ),
);

/** Giant inputs that stress memory. */
const arbitraryGiant = fc.constantFrom(
   "a".repeat(50000),
   '<div class="' + "x".repeat(50000) + '">',
   "{" + "a + ".repeat(10000) + "b}",
   "<script>" + "code; ".repeat(10000) + "</script>",
   "<div>".repeat(5000) + "</div>".repeat(5000),
   "<!".repeat(10000),
   "{".repeat(10000) + "x" + "}".repeat(10000),
);

/** Inject critical chars into every possible context. */
const arbitraryInjection = fc.tuple(
   fc.constantFrom(
      '<div CLASS="VALUE">',
      '<div CLASS={EXPR}>',
      "{EXPR}",
      "<!-- COMMENT -->",
      "<script>CODE</script>",
      "<style>CSS</style>",
      "</TAG>",
      "<br/>",
   ),
   fc.constantFrom(...CRITICAL_CHARS),
   fc.integer({ min: 0, max: 30 }),
).map(([ctx, ch, pos]) => ctx.slice(0, pos) + ch + ctx.slice(pos));

// ===========================================================================
// Helpers — invariant assertions
// ===========================================================================

const ERROR_KINDS = new Set([
   SyntaxKind.UnterminatedString,
   SyntaxKind.UnterminatedComment,
   SyntaxKind.UnterminatedExpression,
   SyntaxKind.UnterminatedScript,
   SyntaxKind.UnterminatedStyle,
   SyntaxKind.UnterminatedDoctype,
]);

const ZERO_WIDTH_ALLOWED = new Set([
   SyntaxKind.EndOfFile,
   SyntaxKind.ExpectedTagName,
   SyntaxKind.ExpectedTagEnd,
   SyntaxKind.UnexpectedCharacter,
   ...ERROR_KINDS,
]);

/** Return only data tokens (excludes EndOfFile and error diagnostics). */
function dataTokensOf(input: string) {
   return tokenize(input).filter(
      t => t.type !== SyntaxKind.EndOfFile && !ERROR_KINDS.has(t.type),
   );
}

// ---------------------------------------------------------------------------
// Property 1: Coverage — every char is covered by exactly one data token
// ---------------------------------------------------------------------------
function assertCoverage(input: string) {
   const coverage = new Array(input.length).fill(0);
   for (const t of dataTokensOf(input)) {
      for (let i = t.start; i < t.end && i < input.length; i++) {
         coverage[i]++;
      }
   }
   for (let i = 0; i < input.length; i++) {
      if (coverage[i] !== 1) {
         throw new Error(
            `Position ${i} (${JSON.stringify(input[i])}) covered by ${coverage[i]} tokens ` +
            `in ${JSON.stringify(input)}`
         );
      }
   }
}

// ---------------------------------------------------------------------------
// Property 2: Contiguity — data tokens tile the input with no gaps or overlaps
// ---------------------------------------------------------------------------
function assertContiguous(input: string) {
   const tokens = dataTokensOf(input);
   if (tokens.length === 0) {
      if (input.length === 0) return;
      throw new Error("No tokens for non-empty input");
   }
   if (tokens[0].start !== 0) {
      throw new Error(`First token starts at ${tokens[0].start}, expected 0`);
   }
   for (let i = 1; i < tokens.length; i++) {
      if (tokens[i].start !== tokens[i - 1].end) {
         throw new Error(
            `Gap/overlap between tokens ${i - 1} and ${i} ` +
            `(end=${tokens[i - 1].end}, start=${tokens[i].start}) ` +
            `in ${JSON.stringify(input)}`
         );
      }
   }
   if (tokens[tokens.length - 1].end !== input.length) {
      throw new Error(
         `Last token ends at ${tokens[tokens.length - 1].end}, expected ${input.length}`
      );
   }
}

// ---------------------------------------------------------------------------
// Property 3: Position validity — all positions in-bounds and monotonic
// ---------------------------------------------------------------------------
function assertValidPositions(input: string) {
   const tokens = tokenize(input);
   for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.start < 0 || t.start > input.length) {
         throw new Error(`Token ${i} start ${t.start} out of bounds [0, ${input.length}]`);
      }
      if (t.end < 0 || t.end > input.length) {
         throw new Error(`Token ${i} end ${t.end} out of bounds [0, ${input.length}]`);
      }
      if (t.end < t.start) {
         throw new Error(`Token ${i} has end (${t.end}) < start (${t.start})`);
      }
   }
   const data = dataTokensOf(input);
   for (let i = 1; i < data.length; i++) {
      if (data[i].start < data[i - 1].start) {
         throw new Error("Data tokens are not in monotonic order");
      }
   }
}

// ---------------------------------------------------------------------------
// Property 4: Value correctness — every token's value matches its source slice
// ---------------------------------------------------------------------------
function assertValuesMatch(input: string) {
   for (const t of tokenize(input)) {
      if (t.value !== undefined && !ERROR_KINDS.has(t.type)) {
         const expected = input.slice(t.start, t.end);
         if (t.value !== expected) {
            throw new Error(
               `${t.type}(${t.start},${t.end}) value=${JSON.stringify(t.value)} ` +
               `!= slice ${JSON.stringify(expected)}`
            );
         }
      }
   }
}

// ---------------------------------------------------------------------------
// Property 5: Zero-width — only expected token kinds may have zero width
// ---------------------------------------------------------------------------
function assertNoZeroWidth(input: string) {
   for (const t of tokenize(input)) {
      if (!ZERO_WIDTH_ALLOWED.has(t.type) && t.start === t.end) {
         throw new Error(`${t.type} at ${t.start} has zero width in ${JSON.stringify(input)}`);
      }
   }
}

// ---------------------------------------------------------------------------
// Property 6: Termination — tokenize completes within a reasonable time
// ---------------------------------------------------------------------------
function assertTerminates(input: string) {
   const start = performance.now();
   tokenize(input);
   const elapsed = performance.now() - start;
   if (elapsed > 1000) {
      throw new Error(`Tokenization took ${elapsed.toFixed(0)}ms for ${JSON.stringify(input).slice(0, 80)}`);
   }
}

// ---------------------------------------------------------------------------
// Property 7: Determinism — same input always produces same tokens
// ---------------------------------------------------------------------------
function assertDeterministic(input: string) {
   const a = tokenize(input);
   const b = tokenize(input);
   if (a.length !== b.length) {
      throw new Error(`Different token count: ${a.length} vs ${b.length}`);
   }
   for (let i = 0; i < a.length; i++) {
      if (a[i].type !== b[i].type || a[i].start !== b[i].start || a[i].end !== b[i].end) {
         throw new Error(`Token ${i} differs: ${JSON.stringify(a[i])} vs ${JSON.stringify(b[i])}`);
      }
   }
}

// ---------------------------------------------------------------------------
// Property 8: EndOfFile invariant — always last token
// ---------------------------------------------------------------------------
function assertEndOfFileLast(input: string) {
   const tokens = tokenize(input);
   if (tokens.length === 0) throw new Error("No tokens");
   if (tokens[tokens.length - 1].type !== SyntaxKind.EndOfFile) {
      throw new Error(`Last token is ${tokens[tokens.length - 1].type}, expected EndOfFile`);
   }
}

// ---------------------------------------------------------------------------
// Property 9: No token kind is emitted outside its valid context
//   - CloseBrace only after JsExpression
//   - Equals only after AttributeName or Whitespace
// ---------------------------------------------------------------------------
function assertTokenContexts(input: string) {
   const tokens = tokenize(input).filter(t => t.type !== SyntaxKind.EndOfFile);
   for (let i = 0; i < tokens.length; i++) {
      const kind = tokens[i].type;
      const prev = i > 0 ? tokens[i - 1].type : null;

      if (kind === SyntaxKind.CloseBrace && prev !== SyntaxKind.JsExpression && prev !== SyntaxKind.OpenBrace) {
         throw new Error(`CloseBrace at ${i} after ${prev} in ${JSON.stringify(input)}`);
      }
      if (kind === SyntaxKind.Equals && prev !== SyntaxKind.AttributeName && prev !== SyntaxKind.Whitespace) {
         throw new Error(`Equals at ${i} after ${prev} in ${JSON.stringify(input)}`);
      }
   }
}

// ===========================================================================
// Tests — organized by property
// ===========================================================================

const NUM_RUNS_RANDOM = 5000;
const NUM_RUNS_HTML = 3000;
const NUM_RUNS_MUTATED = 3000;
const NUM_RUNS_FOCUSED = 2000;

describe("tokenizer properties", () => {

   // -- Coverage --
   describe("coverage — every char exactly once", () => {
      it("random ASCII", () => {
         fc.assert(fc.property(arbitraryAscii, assertCoverage), { numRuns: NUM_RUNS_RANDOM });
      });
      it("HTML fragments", () => {
         fc.assert(fc.property(arbitraryHtmlDoc, assertCoverage), { numRuns: NUM_RUNS_HTML });
      });
      it("mutated templates", () => {
         fc.assert(fc.property(arbitraryMutated, assertCoverage), { numRuns: NUM_RUNS_MUTATED });
      });
      it("boundary inputs", () => {
         fc.assert(fc.property(arbitraryBoundary, assertCoverage), { numRuns: NUM_RUNS_FOCUSED });
      });
      it("deep nesting", () => {
         fc.assert(fc.property(arbitraryDeepNest, assertCoverage), { numRuns: NUM_RUNS_FOCUSED });
      });
      it("repetition floods", () => {
         fc.assert(fc.property(arbitraryRepetition, assertCoverage), { numRuns: NUM_RUNS_FOCUSED });
      });
      it("injection fuzzing", () => {
         fc.assert(fc.property(arbitraryInjection, assertCoverage), { numRuns: NUM_RUNS_FOCUSED });
      });
   });

   // -- Contiguity --
   describe("contiguity — no gaps or overlaps", () => {
      it("random ASCII", () => {
         fc.assert(fc.property(arbitraryAscii, assertContiguous), { numRuns: NUM_RUNS_RANDOM });
      });
      it("HTML fragments", () => {
         fc.assert(fc.property(arbitraryHtmlDoc, assertContiguous), { numRuns: NUM_RUNS_HTML });
      });
      it("mutated templates", () => {
         fc.assert(fc.property(arbitraryMutated, assertContiguous), { numRuns: NUM_RUNS_MUTATED });
      });
      it("boundary inputs", () => {
         fc.assert(fc.property(arbitraryBoundary, assertContiguous), { numRuns: NUM_RUNS_FOCUSED });
      });
      it("deep nesting", () => {
         fc.assert(fc.property(arbitraryDeepNest, assertContiguous), { numRuns: NUM_RUNS_FOCUSED });
      });
      it("repetition floods", () => {
         fc.assert(fc.property(arbitraryRepetition, assertContiguous), { numRuns: NUM_RUNS_FOCUSED });
      });
      it("injection fuzzing", () => {
         fc.assert(fc.property(arbitraryInjection, assertContiguous), { numRuns: NUM_RUNS_FOCUSED });
      });
   });

   // -- Position validity --
   describe("structure — positions, values, shape", () => {
      it("positions in-bounds and monotonic", () => {
         fc.assert(fc.property(arbitraryAscii, assertValidPositions), { numRuns: NUM_RUNS_RANDOM });
      });
      it("values match source slice", () => {
         fc.assert(fc.property(arbitraryAscii, assertValuesMatch), { numRuns: NUM_RUNS_RANDOM });
      });
      it("no unexpected zero-width tokens", () => {
         fc.assert(fc.property(arbitraryAscii, assertNoZeroWidth), { numRuns: NUM_RUNS_RANDOM });
      });
      it("token contexts are valid", () => {
         fc.assert(fc.property(arbitraryAscii, assertTokenContexts), { numRuns: NUM_RUNS_RANDOM });
      });

      it("HTML positions in-bounds", () => {
         fc.assert(fc.property(arbitraryHtmlDoc, assertValidPositions), { numRuns: NUM_RUNS_HTML });
      });
      it("HTML values match", () => {
         fc.assert(fc.property(arbitraryHtmlDoc, assertValuesMatch), { numRuns: NUM_RUNS_HTML });
      });

      it("mutated positions in-bounds", () => {
         fc.assert(fc.property(arbitraryMutated, assertValidPositions), { numRuns: NUM_RUNS_MUTATED });
      });
      it("mutated values match", () => {
         fc.assert(fc.property(arbitraryMutated, assertValuesMatch), { numRuns: NUM_RUNS_MUTATED });
      });

      it("boundary positions in-bounds", () => {
         fc.assert(fc.property(arbitraryBoundary, assertValidPositions), { numRuns: NUM_RUNS_FOCUSED });
      });
      it("deep nesting positions in-bounds", () => {
         fc.assert(fc.property(arbitraryDeepNest, assertValidPositions), { numRuns: NUM_RUNS_FOCUSED });
      });
      it("repetition positions in-bounds", () => {
         fc.assert(fc.property(arbitraryRepetition, assertValidPositions), { numRuns: NUM_RUNS_FOCUSED });
      });
      it("injection positions in-bounds", () => {
         fc.assert(fc.property(arbitraryInjection, assertValidPositions), { numRuns: NUM_RUNS_FOCUSED });
      });
   });

   // -- EndOfFile and empty input --
   describe("invariants — EndOfFile, empty input", () => {
      it("EndOfFile is always last token", () => {
         fc.assert(fc.property(arbitraryAscii, assertEndOfFileLast), { numRuns: NUM_RUNS_RANDOM });
      });
      it("EndOfFile last for HTML", () => {
         fc.assert(fc.property(arbitraryHtmlDoc, assertEndOfFileLast), { numRuns: NUM_RUNS_HTML });
      });
      it("EndOfFile last for mutated", () => {
         fc.assert(fc.property(arbitraryMutated, assertEndOfFileLast), { numRuns: NUM_RUNS_MUTATED });
      });
      it("empty input produces only EndOfFile", () => {
         const tokens = tokenize("");
         expect(tokens).toHaveLength(1);
         expect(tokens[0].type).toBe(SyntaxKind.EndOfFile);
      });
   });

   // -- Performance --
   describe("reliability — termination and determinism", () => {
      it("terminates within 1 second (random)", () => {
         fc.assert(fc.property(arbitraryAscii, assertTerminates), { numRuns: NUM_RUNS_RANDOM });
      });
      it("terminates (deep nesting)", () => {
         fc.assert(fc.property(arbitraryDeepNest, assertTerminates), { numRuns: NUM_RUNS_FOCUSED });
      });
      it("terminates (repetition floods)", () => {
         fc.assert(fc.property(arbitraryRepetition, assertTerminates), { numRuns: NUM_RUNS_FOCUSED });
      });
      it("terminates (giant inputs)", () => {
         fc.assert(fc.property(arbitraryGiant, assertTerminates), { numRuns: 50 });
      });
      it("is deterministic", () => {
         fc.assert(fc.property(arbitraryAscii, assertDeterministic), { numRuns: NUM_RUNS_RANDOM });
      });
      it("is deterministic (HTML)", () => {
         fc.assert(fc.property(arbitraryHtmlDoc, assertDeterministic), { numRuns: NUM_RUNS_HTML });
      });
      it("is deterministic (mutated)", () => {
         fc.assert(fc.property(arbitraryMutated, assertDeterministic), { numRuns: NUM_RUNS_MUTATED });
      });
   });
});
