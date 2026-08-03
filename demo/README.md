# Demo

Run these with `tsx` (already available via node_modules):

```
pnpm tsx demo/tokenizer.demo.ts
pnpm tsx demo/parser.demo.ts
pnpm tsx demo/stress.demo.ts
```

- `tokenizer.demo.ts` — shows how a view is split into tokens. It prints each
  input followed by its tokens (kind, character span, value), including tricky
  cases: nested template literals, regexes, comments, and an unterminated
  server block.
- `parser.demo.ts` — parses a full view (server block plus directives like
  `.when`, `.for`, `@click`) and prints the resulting AST as a tree, then
  demonstrates parser reuse via `reset()`.
- `stress.demo.ts` — pushes both the tokenizer and the parser to their limits:
  100 server blocks, 5k-line server blocks, deep nesting, 10k/100k elements,
  null bytes and binary garbage, unterminated strings and regexes. It also
  verifies invariants such as non-overlapping tokens and stateless tokenizing.
  Exits non-zero on any failure.
