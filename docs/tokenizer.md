# Tokenizer Internals

The tokenizer converts raw Sliz source text into a flat array of tokens. It is a single-pass, character-by-character scanner that never throws on malformed input — instead it emits diagnostics and emits partial tokens, then continues scanning from the next sync point.

---

## File Layout

```
src/tokenizer/
  cursor.ts       CharacterCursor — index-based read cursor over source string
  token.ts        SyntaxKind enum + Token interface + TokenizerContext
  tokenize.ts     Entry point: tokenize() + dispatch()
  consumer.ts     All token consumption logic (the bulk of the tokenizer)

src/scanner/
  char.ts         Char code constants (char.lessThan = 60, etc.)
  is.ts           Predicates — is.whitespace(), is.tagEnd(), is.commentOpen(), etc.
  skip.ts         Skip functions — skip.whiteSpace(), skip.string(), skip.braceExpression(), etc.
```

---

## Entry Point

```ts
tokenize(context: CompilerContext) → Token[]
```

1. Creates a `CharacterCursor` from `context.source`.
2. Creates a `TokenizerContext` (cursor, token list, diagnostics array).
3. Loops calling `dispatch(ctx)` until `cursor.eof`.
4. Returns the token array.

Diagnostics are pushed into `context.diagnostics` (shared reference).

---

## dispatch

```ts
function dispatch(ctx) {
  switch (cursor.peek()) {
    case "<":
      consume.markup(ctx);
      break;
    case "{":
      consume.expression(ctx);
      break;
    default:
      consume.text(ctx);
      break;
  }
}
```

Three entry points based on the current character:

- `<` → markup (tags, comments, doctypes)
- `{` → expressions
- anything else → plain text

---

## Sync Points

Every consumer stops scanning when it hits one of these characters:

| Character  | Meaning                                   |
| ---------- | ----------------------------------------- |
| `<`        | Start of a tag or comment                 |
| `{`        | Start of an expression                    |
| `>`        | End of a tag                              |
| `/`        | Potential self-closing tag or closing tag |
| whitespace | Delimiter between tokens                  |
| EOF        | End of source                             |

When a consumer encounters a sync point it can't handle, it returns immediately. The outer `dispatch` loop picks up from there. This keeps error scope minimal — a malformed expression doesn't eat a closing tag, and a malformed tag doesn't eat the next element.

---

## Consumer Functions

### Top-level

| Function     | Input                       | Produces                                                  |
| ------------ | --------------------------- | --------------------------------------------------------- |
| `text`       | plain text until `<` or `{` | `Text` token                                              |
| `expression` | `{ ... }`                   | `OpenBrace` + `JsExpression` + `CloseBrace` tokens        |
| `markup`     | `<...`                      | dispatches to comment / doctype / closingTag / openingTag |

### Tag consumers

| Function         | Input                                        | Produces                                           |
| ---------------- | -------------------------------------------- | -------------------------------------------------- |
| `openingTag`     | `<div class="x">`                            | `LessThan` + `TagName` + attributes + tag end      |
| `closingTag`     | `</div>`                                     | `LessThan` + `Slash` + `TagName` + tag end         |
| `tagEnd`         | `>` or `/>`                                  | `GreaterThan` or `SlashGreaterThan`                |
| `attributes`     | loops calling `attribute`                    | multiple `AttributeName` + `AttributeValue` tokens |
| `attribute`      | `name="value"`                               | `AttributeName` + optionally `Equals` + value      |
| `attributeValue` | dispatches to expression / quoted / unquoted | value tokens                                       |

### Special content

| Function      | Input                         | Produces            |
| ------------- | ----------------------------- | ------------------- |
| `doctype`     | `<!DOCTYPE ...>`              | `Doctype` token     |
| `htmlComment` | `<!-- ... -->`                | `HtmlComment` token |
| `script`      | raw content until `</script>` | `Script` token      |
| `style`       | raw content until `</style>`  | `Style` token       |

---

## Token Types (SyntaxKind)

```
Doctype, Text, LessThan, Slash, OpenBrace, JsExpression, CloseBrace,
TagName, AttributeName, AttributeValue, GreaterThan, SlashGreaterThan,
Script, Style, HtmlComment, EndOfFile
```

Each token has: `kind`, `start` (inclusive), `end` (exclusive), `value` (source text, `undefined` for EOF).

The `EndOfFile` token is always emitted as the last token, with `start === end === source.length` and `value === undefined`. The parser can use it as a sentinel to stop reading.

---

## Scanner Layer

### is.* (predicates)

Pure checks — never advance the cursor.

```
is.whitespace(code)       space, tab, \n, \r
is.alpha(code)            a-z, A-Z
is.quote(code)            ' or "
is.tagEnd(ctx)            > or />
is.closingTagStart(ctx)   </
is.lineCommentStart(ctx)  //
is.blockCommentStart(ctx) /*
is.doctype(ctx)           <!DOCTYPE
is.commentOpen(ctx)       <!--
is.commentClose(ctx)      -->
is.scriptClosingTag(ctx)  </script>
is.styleClosingTag(ctx)   </style>
```

### skip.* (advancers)

Advance the cursor past a syntactic construct, ignoring its content.

```
skip.whiteSpace(ctx)       whitespace characters
skip.string(ctx)           '...' or "..." (handles \ escapes)
skip.template(ctx)         `...` (handles ${} interpolation)
skip.braceExpression(ctx)  { ... } (tracks nesting, skips strings)
skip.lineComment(ctx)      // ... until \n
skip.blockComment(ctx)     /* ... */
```

Key rule: `skip.*` functions are void. They advance and the caller checks where the cursor ended up (eof, specific character, etc.).

---

## Error Recovery

The tokenizer never throws. When it encounters malformed input:

1. **Emit a diagnostic** with position range and descriptive message.
2. **Emit partial tokens** for whatever was successfully read.
3. **Stop at the next sync point** — cursor stays at `<`, `{`, `>`, etc.
4. **Return** — the outer `dispatch` loop takes over.

Example:

```
<div>{unclosed expression</div>
```

- `expression` scans `{unclosed expression`
- Hits `</` → emits `UnterminatedExpression` error + partial tokens
- Cursor stays at `<`
- `dispatch` sees `<` → `markup` → `closingTag` handles `</div>` normally

---

## Diagnostic Codes

| Code    | Meaning                        |
| ------- | ------------------------------ |
| SLIZ001 | Unterminated expression        |
| SLIZ002 | Unterminated doctype           |
| SLIZ003 | Expected tag name              |
| SLIZ004 | Unterminated attribute value   |
| SLIZ005 | Expected tag end (`>` or `/>`) |
| SLIZ006 | Unterminated comment           |
| SLIZ007 | Nested comment                 |
| SLIZ008 | Unterminated script            |
| SLIZ009 | Unterminated style             |

---

## Design Principles

1. **Single pass** — no backtracking, no multi-lookahead.
2. **Never throw** — emit diagnostic, emit partial tokens, continue.
3. **Minimal error scope** — sync points prevent one malformed construct from consuming another.
4. **Character codes, not strings** — all comparisons use numeric char codes for speed.
5. **Namespace grouping** — `is.*`, `skip.*`, `consume.*` keep related logic together.
