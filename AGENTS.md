# AGENTS.md — Sliz

Read this file in full before making any change in this repository. If a request conflicts with anything in this document, follow this file and flag the conflict instead of silently deviating.

---

## Package Manager

**pnpm only.** Lockfile: `pnpm-lock.yaml`.

## Commands

- `pnpm build` — tsup → dist/
- `pnpm dev` — tsup --watch
- `pnpm test` — vitest run
- `pnpm typecheck` — tsc --noEmit
- `pnpm format` — biome format --write .

---

## Architecture

Sliz is an HTML-like template compiler. Pipeline stages:

1. **Scanner** (`src/scanner/`) — char codes, predicates (`is.*`), skip logic (`skip.*`)
2. **Tokenizer** (`src/tokenizer/`) — source → `Token[]` via `CharacterCursor`
3. **Parser** (`src/parser/`) — tokens → HTML AST via `htmlparser2`
4. **Transformer** (`src/transformers/`) — HTML AST → `TransformedNode[]` (handles `.when` conditionals, extracts `{expressions}`)
5. **Codegen** (`src/codegen.ts`) — `TransformedNode[]` → JS output string

- **Entry point:** `src/pipeline/compile.ts` → `compile(context)`. Currently only tokenizes; parser/transform/codegen are not yet wired into the pipeline.
- **Exports:** `compile`, `CompilerContext`, `Diagnostic`, `tokenize` from `src/index.ts`.

---

## .sliz Syntax (Current, Early, Evolving)

```html
<script server>
  // server-side setup/state/logic — plain TS
</script>

<div class="{jscode}">{jscode}</div>
<button .when="{data}"></button>
```

- `{expr}` is interpolation of a JS/TS expression — not JSX. Control flow (loops, conditionals) is handled by dedicated directives, never by embedding `.map()`/ternaries in markup.
- Dot-prefixed attributes (`.when=`, and future ones) are compiler-owned directives — distinct from plain HTML attributes. Don't blur the two.
- Treat every syntax detail here as provisional unless it's written in a confirmed spec file.

---

## Parser Behavior & Spec Rules

- **No Throwing:** Parsers must be single-pass where feasible and must **never throw on malformed input** — degrade gracefully. A throw in a parser is a bug unless it's a genuinely unrecoverable internal invariant violation, and that must be commented as such.
- **Structured Parsing:** Prefer a real structured (recursive-descent or equivalent) parser over regex for anything with nesting. Regex is fine only for flat, fixed-shape tokens.
- **Spec is Source of Truth:**
- Never reintroduce a previously-dropped mechanism without an explicit, current instruction.
- Before implementing new syntax or compiler behavior, check whether a spec file already describes it. If it does, implement to the spec exactly. If it doesn't, surface the gap and wait for confirmation instead of inventing one.
- Any new directive or grammar construct is a breaking, versioned decision — don't add one speculatively while doing something else.

---

## Coding Style & Conventions

### 1. Tooling & Formatting

- **Biome:** Biome is used for formatting and linting (no Prettier/ESLint config). Never hand-format against it, never argue with it in a diff — if formatting looks wrong, fix the `biome.json` config, don't fight it inline.

### 2. Comments

- A comment explaining _what_ code does is low value — the code should mostly say that itself.
- A comment explaining _why_ the code exists or does something a non-obvious way is the bar.
- If you find yourself needing a long comment to explain how a piece of code works, that's a signal the code itself is too clever — rewrite it plainly instead of documenting the cleverness.
- Every `try/catch` must carry a comment stating exactly what error is being caught and why it can't be prevented structurally instead.

### 3. No Ternaries, Ever

Always a full `if/else` block. No shortcuts, no nesting exceptions.

```ts
// BAD
const label = isActive ? "active" : "inactive";

// GOOD
let label: string;
if (isActive) {
  label = "active";
} else {
  label = "inactive";
}
```

### 4. Classes: Allowed for One Specific Case

Default to plain functions and plain objects. Reach for a class **only** when a factory function would otherwise have to return a large object/interface bundling many methods together — a class reduces duplication there. Don't reach for a class outside that case (not for simple data holders, single-method helpers, or anything expressible as a plain function).

```ts
// GOOD — plain function, single responsibility, no reason for a class
function parseHeader(input: string): Header {
  // ...
}

// GOOD — class justified: several methods sharing state, would otherwise mean
// repeating the same config/state object as the first argument to every function
class TokenStream {
  private position: number = 0;
  private readonly source: string;

  constructor(source: string) {
    this.source = source;
  }

  peek(): string {
    return this.source[this.position];
  }

  advance(): string {
    return this.source[this.position++];
  }

  atEnd(): boolean {
    return this.position >= this.source.length;
  }
}
```

### 5. Generics

Simple generics are fine. Nested generics, ternary/conditional generics, and other complex generic gymnastics are **never allowed** — if a task seems to need one, the type design itself is wrong; redesign it instead of writing the complex generic.

```ts
// GOOD — simple, single-purpose generic
function firstOf<T>(items: readonly T[]): T | undefined {
  return items[0];
}

// BAD — never write this, regardless of how "elegant" it looks
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] }
  : T;
```

### 6. Naming & Identifiers

- **No shorthand/abbreviated identifiers:** No `i`, `j`, `idx`, `tmp`, `el`, etc. Every name should read as a real word or phrase.
- **Casing:** `camelCase` for values, variables, and functions. `PascalCase` for types and classes. **Never `UPPER_SNAKE_CASE**`, anywhere, for anything — including constants.
- **Characters:** Identifiers are alphanumeric only — **no `$`, no `_**`, in any variable, function, or property name.
- **Namespaces:** Namespace-style groupings are encouraged when they make code read naturally, e.g., `is.whitespace(char)`, `skip.string(cursor)` — group related predicates/actions under a short, meaningful namespace object instead of a wall of similarly-prefixed standalone functions.
- **Tokenizer/Scanner implementation specifics:**
- Diagnostic codes use `SLIZ001`–`SLIZ005` prefix.
- Tokenizer uses char-code comparisons (not string comparisons). See `src/scanner/char.ts`.
- The `consume` namespace in `src/tokenizer/consumer.ts` contains all token consumption logic.

```ts
// BAD
for (let i = 0; i < tokens.length; i++) {
  const el = tokens[i];
}

// GOOD
for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
  const token = tokens[tokenIndex];
}

// GOOD — namespace-style grouping
const is = {
  whitespace(char: string): boolean {
    return char === " " || char === "\t" || char === "\n";
  },
  digit(char: string): boolean {
    return char >= "0" && char <= "9";
  },
};
```

### 7. Type Inference

Let the compiler infer — don't annotate what it already knows. Only write an explicit type when TypeScript can't infer it (function parameters, and return types where inference would be ambiguous or where you want a hard contract at a public boundary).

```ts
// BAD — the return type is trivially inferred, the annotation is dead weight
function data(): number {
  return 10;
}

// GOOD
function data() {
  return 10;
}

// STILL GOOD — parameter types can't be inferred, so they stay explicit
function double(value: number) {
  return value * 2;
}
```

### 8. Extraction

Don't extract tiny utilities. If a piece of logic is only 1–2 lines and reused in a couple of places, inline it rather than extracting a util function. Only extract a helper when there's real, non-trivial logic worth naming and centralizing.

### 9. Code Order

Top-to-bottom by dependency, never rely on hoisting. Define independent things first. Define things that depend on them after. Never write code that only works because of function/var hoisting — a reader should be able to read the file straight through without jumping backward or forward. When two things reference each other, keep them physically close together in the file.

### 10. Directness

No hidden behavior. A function or class does exactly what its name says — nothing indirect, nothing extra bolted on "while we're in there" (no surprise logging, no surprise mutation of unrelated state, no surprise side effects a caller wouldn't expect from the name alone).

### 11. Parameters

No default parameters — write two functions instead.

```ts
// BAD — never allow this
function test(data = 10) {
  // ...
}

// GOOD
function testWithDefault() {
  return testWith(10);
}

function testWith(data: number) {
  // ...
}
```

### 12. Module Format

ESM-only (`"type": "module"`). Target: `ESNext` / `ES2022`. DTS via tsup (`dts: { resolve: true }`).

---

## Testing Guidelines

- Tests live in `tests/**/*.test.ts`.
- New grammar additions need a test covering at least one well-formed input and one malformed input.

---

## Agent Workflow Rules

- **Scope:** Stay exactly in scope. Do only what was explicitly asked. "Update that fn" means update only that function — never its callers throughout the codebase, even if that leaves things broken — unless the instruction explicitly says so ("update that fn and all its callers"). Don't take initiative beyond the literal request, no matter how obviously related it seems.
- **File Access:** Don't read unnecessary files. Only read what's explicitly provided or explicitly pointed to in the task. Don't explore or grep the wider codebase to "understand the full structure" for a small, scoped change.
- **Execution:** Implement first, don't over-deliberate. For small/simple tasks, write the solution immediately and let the developer give feedback and iterate, rather than spending a long time reasoning upfront about the "ideal" approach.
- **Speed:** Speed matters. The bar is: finish a small task faster than doing it manually would have taken. Slow deliberation on small tasks is a hindrance to development velocity, not a virtue.

---

## Pre-Submit Checklist

[ ] No ternary was used anywhere in the diff.
[ ] No class was added except where §4's justification applies.
[ ] No nested/ternary/complex generic was introduced.
[ ] No identifier uses a shorthand, `$`, or `_`; casing follows §6 (no `UPPER_SNAKE_CASE`).
[ ] No explicit type was written where inference already covers it.
[ ] No new 1–2 line "convenience" utility was extracted.
[ ] Code reads top-to-bottom with no reliance on hoisting.
[ ] No default parameters were added.
[ ] Nothing does more than its name says.
[ ] Parser changes can't throw on malformed input and are covered by a malformed-input test.
[ ] No new syntax/directive was added without a confirming spec file or explicit instruction.
[ ] The change stays strictly within the requested scope.
[ ] Formatting is clean under Biome (`pnpm format`); `pnpm typecheck` passes.

If any box can't be checked, stop and say so instead of shipping around it.
