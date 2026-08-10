# Tokenizer & Scanner Bug Analysis

Generated from review of `src/tokenizer/` and `src/scanner/`.

---

## Critical Bugs (Crash / Wrong Output)

### 1. `braceExpression` call signature mismatch — `consumer.ts:292`

```ts
const end = skip.braceExpression(ctx.cursor.source, start.position);
```

`skip.braceExpression` expects a `TokenizerContext`, not `(string, number)`. This is a **type error** that will cause a runtime crash.

---

### 2. `braceExpression` return type mismatch — `consumer.ts:292` + `skip.ts:161`

`skip.braceExpression` returns `boolean` (`true`/`false`), but `consumer.ts` treats it as a **position number** and compares against `-1`:

```ts
if (end === -1) { ... }
```

The consumer expects a char index; the function returns a boolean. This will never match `-1`.

---

### 3. `doctype()` always emits duplicate tokens + false error — `consumer.ts:234-270`

The error/diagnostic + second token push after the `while` loop execute **unconditionally**, even when `>` was successfully found:

```ts
while (!ctx.cursor.eof) {
   if (ctx.cursor.peek() === char.greaterThan) {
      ctx.cursor.advance();
      ctx.tokens.push({ ... }); // first push
      break;
   }
   ctx.cursor.advance();
}

// These ALWAYS run — missing a return or else guard
ctx.diagnostics.push({ message: "Unterminated doctype", ... });
ctx.tokens.push({ ... }); // duplicate
ctx.cursor.advanceToEnd();
```

Every valid `<!DOCTYPE>` produces two tokens and a false "Unterminated doctype" error.

---

### 4. `skip.whiteSpace` called with wrong type — `consumer.ts:55,62`

```ts
skip.whiteSpace(ctx.cursor)
```

`whiteSpace` is defined as:

```ts
export function whiteSpace(ctx: TokenizerContext) {
   const { cursor } = ctx;
```

It destructures `cursor` from its argument, but `consumer.ts` passes a `CharacterCursor` (not a `TokenizerContext`). A `CharacterCursor` has no `.cursor` property — this will crash at runtime.

---

## Logic Bugs

### 5. `peek()` returns `NaN` on EOF, not `-1` — `cursor.ts:46`

The JSDoc promises `-1` as the sentinel, but `charCodeAt` returns `NaN`:

```ts
peek(offset = 0): number {
   return this.source.charCodeAt(this.index + offset); // NaN at EOF
}
```

Any caller comparing against `-1` will silently fail. Comparisons like `code === char.slash` happen to work because `NaN !== anything`, but this is accidental correctness.

---

### 6. `openingTag()` returns `undefined` on error — `consumer.ts:461-472`

When no tag name is found, it hits a bare `return`:

```ts
if (ctx.cursor.position === tagStart.position) {
   ...
   return; // undefined
}
```

`markup()` then compares `undefined === "script"` — no crash, but the function has no declared return type and silently swallows the error path.

---

### 7. `tagEnd()` uses wrong `SyntaxKind` for self-closing tags — `consumer.ts:603-621`

Self-closing `/>` gets `kind: GreaterThan` with value `"/>"`. There's a `SlashGreaterThan` kind defined in `token.ts:18` but it's never used:

```ts
ctx.tokens.push({
   kind: SyntaxKind.GreaterThan,   // should be SlashGreaterThan
   start: start.position,
   end: ctx.cursor.position,
   value: "/>",
});
```

---

### 8. `tagEnd()` emits error but doesn't advance cursor — `consumer.ts:637-644`

When neither `/>` nor `>` is found, a diagnostic is pushed but the cursor stays put. The outer `dispatch` loop will call `consume.text()` next (since the cursor is still at a non-`<`, non-`{` char), which could spin or produce garbage tokens.

---

### 9. `closingTag` doesn't emit closing `>` token — `consumer.ts:161-220`

After reading the tag name and calling `skip.whiteSpace`, it calls `tagEnd(ctx)`. But the tag name has already consumed past any whitespace, so `tagEnd` may land on unexpected input. The `>` token's `start`/`end` are positioned after the tag name, not logically after the `/`.

---

## Dead Code

### 10. `is.attributeName()` never used — `is.ts:57-62`

Defined but never called. The consumer's `attribute()` function reimplements the same logic inline with its own break conditions.

---

### 11. `SyntaxKind.SlashGreaterThan` never emitted — `token.ts:18`

Defined in the enum but no code path ever creates a token with this kind. Self-closing tags use `GreaterThan` instead.

---

## Design Issues

### 12. Inconsistent API surface between skip and consumer

- `skip.whiteSpace` expects `TokenizerContext`
- `skip.braceExpression` expects `TokenizerContext` but is called with `(string, number)`
- Consumer functions always take `TokenizerContext`

The API boundaries are mismatched throughout.

---

### 13. `tagName` lowercased but token value is not — `consumer.ts:474`

```ts
const tagName = ctx.cursor.getChars(tagStart).toLowerCase();
ctx.tokens.push({
   kind: SyntaxKind.TagName,
   ...
   value: ctx.cursor.getChars(tagStart), // original case
});
```

The returned `tagName` is lowercased, but the token stores the original case. Downstream consumers see different casing depending on which path they use.

---

### 14. `closingTag` emits `<` and `/` as separate tokens — `consumer.ts:198-210`

This differs from `openingTag` which emits `<` and the tag name. The closing tag produces **three** tokens (`<`, `/`, tagname) — an inconsistent token structure that complicates downstream parsing.

---

## Priority Order

| # | Severity | Location | Issue |
|---|----------|----------|-------|
| 1 | **Crash** | `consumer.ts:292` | Wrong arg types to `braceExpression` |
| 2 | **Crash** | `consumer.ts:292` | Boolean vs position return type mismatch |
| 4 | **Crash** | `consumer.ts:55,62` | `whiteSpace` called with `CharacterCursor` instead of `TokenizerContext` |
| 3 | **Data corruption** | `consumer.ts:254-269` | Duplicate tokens + false diagnostic on every doctype |
| 5 | **Silent failure** | `cursor.ts:46` | `peek()` returns `NaN` instead of documented `-1` |
| 7 | **Wrong token** | `consumer.ts:613-618` | Self-closing `/>` emitted as `GreaterThan` not `SlashGreaterThan` |
| 8 | **Infinite loop risk** | `consumer.ts:637-644` | `tagEnd` error doesn't advance cursor |
| 6 | **Minor** | `consumer.ts:461-472` | `openingTag` returns `undefined` on error |
| 9 | **Structural** | `consumer.ts:161-220` | `closingTag` token structure inconsistent |
| 10-14 | **Cleanup** | Various | Dead code, API inconsistency, case mismatch |
