# JsInterpolationResolver

Located at `src/common/JsInterpolationResolver.ts`.

## Purpose

Sliz templates embed JavaScript expressions inside `{...}` (see `.sliz` syntax).
When the pipeline hits an opening brace in markup, it needs to know where that
interpolation ends, not just the next `}`, because the expression can contain
nested braces, object literals, blocks, and template literals with their own
`${...}` interpolation.

`JsInterpolationResolver` takes the index of an opening `{` and finds the
matching closing `}` that terminates the whole JS expression. it uses the
TypeScript lexer to understand the lexical structure rather than naive brace
counting.

## Why the TypeScript scanner

Counting `{` and `}` characters by hand breaks on:

- `}` that appears inside a string: `"a}b"`.
- `}` inside a template literal: `` `a}b` ``.
- `}` inside a comment.
- `}` inside a regex literal: `/}/`.
- `}` that is the tail of a template interpolation: `` `x${ ... }` `` here the
  `}` closes the `${ ... }` interpolation, while the _template_ continues until
  the backtick.

the TS scanner already classifies tokens correctly, so it knows the difference
between a structural brace and a brace-shaped character inside a literal. we
lean on it instead of reimplementing that logic.

## Public surface

```ts
class JsInterpolationResolver {
  constructor(source: string): void;
  resolve(openBraceIndex: number): JsInterpolationOutcome;
}
```

`resolve` is given the position of the opening `{` and returns an outcome. The
shape is unified across all cases, every outcome carries `start`, `end`, and
`text`, with a string-valued enum distinguishing the cases (mirroring the
`TokenType` pattern used by the main tokenizer):

```ts
export enum JsInterpolationStatus {
  Closed = "Closed",
  UnterminatedLiteral = "UnterminatedLiteral",
  UnterminatedEof = "UnterminatedEof",
}

export interface JsInterpolationOutcome {
  status: JsInterpolationStatus;
  start: number;
  end: number;
  text: string;
}
```

- `start`: the index of the original opening `{` (the `openBraceIndex` passed in).
- `end`: the index just past the terminating token, the character offset the
  next stage should resume scanning from.
- `text`: `source.slice(start, end)`, the full interpolation span including the
  surrounding `{}`. Consumers get the raw slice for free.

## Algorithm

### Setup (`resolve`)

0. **Input guard.** `openBraceIndex` has to be a real, non-negative position
   before it ever touches the scanner. TS's `resetTokenState` runs a hard
   `Debug.assert(position >= 0)` internally, so handing it `-2` or `NaN`
   doesn't degrade gracefully, it throws a raw internal error straight out of
   the TypeScript package, not one of our own outcomes. so `resolve` checks
   `Number.isFinite(openBraceIndex) && openBraceIndex >= 0` up front and, if
   that fails, returns `UnterminatedEof` immediately with an empty `text`
   rather than ever calling into the scanner. Out-of-range *positive* values
   don't need this, the scanner already walks off the end of the source and
   hits `EndOfFileToken` on its own, which is handled normally in step 5
   below.
1. Re-feed the whole `source` to the scanner and reset its token state to
   `openBraceIndex + 1` so the first `scan()` lands on the token right after the
   opening brace.
2. Seed the frame stack with a single `FrameKind.Brace` representing the opening
   `{` we are trying to close.
3. Record `previousSignificantKind` as `OpenBraceToken` so the first token is
   treated as occurring after a brace for operator/division disambiguation.

### Token loop

Each iteration scans the next token and runs the following steps in order:

1. **Unterminated block comment check.** This runs before the trivia skip on
   purpose. `/* ...` that never reaches a closing `*/` is still lexed as
   `MultiLineCommentTrivia`, TS just keeps scanning until EOF and hands back
   the trivia token anyway, it doesn't set `isUnterminated()` for comments the
   way it does for strings and templates. left alone, that comment would fall
   straight into the trivia `continue` below and the resolver would never
   notice anything was wrong, it'd just run off the end and report
   `UnterminatedEof` instead of the more specific `UnterminatedLiteral`. so
   when the token is `MultiLineCommentTrivia`, we check whether its text
   actually ends in `*/`. If it doesn't, that's an unterminated comment and we
   return `UnterminatedLiteral` right there. A normal closed comment like
   `/* c */` ends in `*/` and just falls through to the trivia skip like
   before, no change in behavior for the passing case.

2. **Trivia skip.** Whitespace, newlines, comments, and shebang trivia are
   ignored (`continue`), they never affect structure.

3. **Division vs. regex disambiguation.** A `/` token is ambiguous in JS: it can
   be division (`a / b`) or the start of a regex literal (`/=re/`). After certain
   preceding tokens (the `RegexExpectedAfter` set, `return`, `=`, `(`, `,`,
   binary operators, etc.) a `/` can only be regex, so we call
   `reScanSlashToken()` to re-lex it correctly. This prevents a regex body from
   being misread and a later `}` inside it being treated as structural.

4. **Template interpolation disambiguation.** If the scanner produces a
   `CloseBraceToken` while the current frame is a `TemplateInterpolation`, that
   `}` actually belongs to a `${ ... }` inside the template, it's the end of a
   `${` interpolation, not the closing brace of our top-level interpolation. We
   call `reScanTemplateToken(false)` to re-lex it as part of the template
   (producing `TemplateTail` if the template ends here). This is what lets a
   template's own `${...}` nests be walked with the brace stack instead of
   being miscounted.

5. **Unterminated literal guard.** If the scanner reports `isUnterminated()`
   (a string, template, or regex that ran off the end of the source), we return
   `JsInterpolationStatus.UnterminatedLiteral`.

6. **End of file.** An `EndOfFileToken` before the stack empties means the
   interpolation was never closed, return `JsInterpolationStatus.UnterminatedEof`.

7. **Frame pushes.**
   - `OpenBraceToken` → push `FrameKind.Brace`.
   - `TemplateHead` (the `` `...${ `` part of a template) → push
     `FrameKind.TemplateInterpolation`.

8. **Frame pops.** A `CloseBraceToken` (in brace context) or `TemplateTail`
   (the `` }...` `` end of a template) pops the top frame. When the stack returns
   to length 0, the interpolation is closed: return
   `JsInterpolationStatus.Closed` with `end` at the token end.

9. **Track previous.** `previousSignificantKind` is updated to the current token
   (after re-scans) so step 3 can make its division/regex decision next time.

### Why a frame stack instead of a counter

A counter is insufficient because `{` and `${` live in different lexical
contexts. A template literal opened with `` `...${ `` introduces a JS
sub-expression that can contain its own braces, those braces must be balanced
before the template tail closes the original frame. Using distinct frame kinds
(`Brace` vs `TemplateInterpolation`) makes the two nesting contexts explicit and
lets steps 4 and 8 handle each correctly.

## Outcomes summary

| Status                                      | Meaning                                                          |
| -------------------------------------------- | ----------------------------------------------------------------- |
| `JsInterpolationStatus.Closed`               | Found the matching closing `}`.                                   |
| `JsInterpolationStatus.UnterminatedLiteral`  | A string/template/regex/comment ran past end of source unclosed.  |
| `JsInterpolationStatus.UnterminatedEof`      | Reached end of source before `}` was balanced, or input was invalid. |

In the unterminated cases the `text` slice still runs from the opening `{` to
wherever scanning gave up (there is no closing `}`), so callers always get a
meaningful span, except for the invalid-input case (negative or `NaN`
`openBraceIndex`), where there's no valid source position to slice from and
`text` comes back empty. All three outcomes share the same shape (`status`,
`start`, `end`, `text`).

## Notes / invariants

- The resolver is purely lexical, it does not parse or type-check the
  expression. It only locates the balanced span.
- It must never throw on malformed input, malformed interpolations are
  reported via the `Unterminated*` outcomes rather than exceptions. that
  includes malformed *calls*, not just malformed source, a negative or `NaN`
  `openBraceIndex` is caught before it ever reaches the scanner instead of
  bubbling up as a raw TypeScript internal assertion.
- Unterminated block comments are detected explicitly by inspecting the
  comment token's own text, not via `isUnterminated()`, since the scanner
  doesn't consider an unclosed `/* ...` to be an unterminated token the way it
  does for strings and templates.
- The scanner is created once per instance and reused across `resolve` calls via
  `setText`, which avoids reallocation when many interpolations are resolved in
  the same source.