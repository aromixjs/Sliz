# Browser HTML Parser Behavior Report

Tested with Chromium via Playwright on all 5 test files (53 edge cases).

---

## 1. Broken Tags (`case1-broken-tags.html`)

### `<` followed by whitespace before tag name

| Input      | Browser Behavior                                                  |
| ---------- | ----------------------------------------------------------------- |
| `< div>`   | **Text node** `< div>` — NOT a tag. `<` + space = raw text.       |
| `<   div>` | **Text node** `<   div>` — same, multiple spaces don't change it. |
| `<\tdiv>`  | **Text node** `<\tdiv>` — tab same as space.                      |
| `<\ndiv>`  | **Text node** `<\ndiv>` — newline same as space.                  |

**RULE: `<` must be immediately followed by an ASCII alpha or `/` to start a tag. Any other character (including whitespace) makes it text.**

### Unclosed tags (no `>`)

| Input                                  | Browser Behavior                                     |
| -------------------------------------- | ---------------------------------------------------- |
| `<div>no closing bracket`              | Creates `<div>` element, auto-closes at end of file. |
| `<div class="test">no closing bracket` | Creates `<div class="test">`, auto-closes.           |

**RULE: Missing `>` doesn't prevent tag from being parsed. The tag is still created.**

### Closing tag with space: `</ div>`

| Input     | Browser Behavior                                                                                     |
| --------- | ---------------------------------------------------------------------------------------------------- |
| `</ div>` | **Bogus comment** `<!-- div-->` — the space after `</` makes the parser treat it as a bogus comment. |

**RULE: `</` must be immediately followed by an ASCII alpha to start a closing tag. Space/whitespace = bogus comment.**

### Self-closing: `<br />` vs `<br/>`

| Input    | Browser Behavior                             |
| -------- | -------------------------------------------- |
| `<br />` | `<br>` — void element, self-closing ignored. |
| `<br/>`  | `<br>` — same.                               |

**RULE: For HTML void elements (`br`, `img`, `input`, etc.), `/>` is ignored. They're always rendered as open.**

### Unclosed tag at end of file

| Input                  | Browser Behavior                     |
| ---------------------- | ------------------------------------ |
| `<div>unclosed at end` | Creates `<div>`, auto-closed at EOF. |

---

## 2. Absurd Attributes (`case2-absurd-attributes.html`)

### Boolean attributes (no value)

| Input                                   | Browser Behavior                                             |
| --------------------------------------- | ------------------------------------------------------------ |
| `<div class>`                           | `class=""` — attribute gets empty string value.              |
| `<div class id="test">`                 | `class="" id="test"` — both work.                            |
| `<div disabled>`                        | `disabled=""` — standard boolean attr.                       |
| `<input disabled readonly type="text">` | All three attrs work: `disabled="" readonly="" type="text"`. |

**RULE: Attribute without `=` gets value `""`.**

### Quoting styles

| Input                                  | Browser Behavior                                             |
| -------------------------------------- | ------------------------------------------------------------ |
| `<div class=test>`                     | `class="test"` — unquoted works.                             |
| `<div class='single'>`                 | `class="single"` — single-quoted works.                      |
| `<div class="">`                       | `class=""` — double-quoted works.                            |
| `<div class = "spaces around equals">` | `class="spaces around equals"` — spaces around `=` are fine. |

### `>` inside attribute values

| Input               | Browser Behavior                                    |
| ------------------- | --------------------------------------------------- |
| `<div title="a>b">` | `title="a>b"` — `>` inside quoted value is literal. |

**RULE: `>` only ends a tag when it's outside a quoted attribute value.**

### Unclosed attribute quote

| Input                                 | Browser Behavior                                                                                                                                                                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<div title="unclosed>unclosed quote` | `title="unclosed>unclosed quote"` — the `>` inside the unclosed quote becomes part of the value, NOT the tag end. The tag extends to the next `>` or end of input. Wait actually: it becomes `title="unclosed>unclosed quote</div>`. Let me re-check... |

**Actually re-examining**: `<div title="unclosed>unclosed quote</div>` parses as:

- `<div title="unclosed>unclosed quote</div>` → the `"` is never closed, so the browser consumes everything as the attribute value until... it actually closes the `"` with the `"` in `</div>` (the `<` in `</div>` doesn't end the tag because we're still inside a quoted attribute). Then the `</div>` closes the tag.

Actually the DOM shows: `<div title="unclosed>unclosed quote</div>` — the **entire** content from `"unclosed>unclosed quote</div>` becomes the attribute value because the quote was never closed.

**RULE: Unclosed quote consumes everything until a matching quote is found, or the tag is abandoned.**

### Mixed quoting: `<div class=" double"="" id="single" data-x="unquoted">`

| Browser Result                                                                                                                                                                                                           | `class=" double"="" id="single" data-x="unquoted"` |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| The browser sees: `class` has value `" double"` (the outer double-quotes are the delimiters, the inner `"` terminates the value), then `=""` is a new attribute with empty name and value `""`, then `id="single"`, etc. |

**Wait — re-reading the DOM output**: `class=" double"=""` — actually the browser parsed it as attribute `class` with value `" double"` (note: the leading space is part of the value). Then `=""` is a separate boolean attribute with empty name. Then `id="single"`.

Actually let me re-examine. The HTML is `class=" double"=""`. The parser sees:

1. `class=` — start attribute `class`
2. `"` — start double-quoted value
3. ` double"` — the second `"` ends the value → value is ` double`
4. `=""` — new attribute with name `` (empty string), value `""`

Hmm, that's weird. Let me look at the actual DOM dump again: `class=" double"="" id="single" data-x="unquoted"`. This means class got value `" double"` (with the quotes as literal characters). No wait — the DOM attribute value ` double` doesn't have quotes. The serialization `class=" double"` means value is ` double`.

**RULE: After the first `"`, everything until the next `"` is the attribute value. No nesting.**

### Duplicate attributes

| Input                                | Browser Behavior                                     |
| ------------------------------------ | ---------------------------------------------------- |
| `<div class="first" class="second">` | `class="first"` — **first wins**, second is ignored. |

**RULE: Duplicate attributes → first value wins, second silently dropped.**

### Weird attribute names

| Input                       | Browser Result                              |
| --------------------------- | ------------------------------------------- |
| `<div data--custom="test">` | `data--custom="test"` — double dashes fine. |
| `<div 123="test">`          | `123="test"` — numeric name fine.           |
| `<div @click="handler">`    | `@click="handler"` — `@` in name fine.      |
| `<div #ref="">`             | `#ref=""` — `#` in name fine.               |

**RULE: Attribute names can contain almost any character except whitespace, `"`, `'`, `=`, `<`, `>`, and backtick.**

---

## 3. Expressions / Braces (`case3-expressions.html`)

**CRITICAL FINDING: The browser's HTML parser has ZERO concept of `{` `}` as special syntax. Braces are ordinary characters.**

### How braces are parsed in attributes

| Input              | Browser Result | Explanation                                                                                                                                                                                                                   |
| ------------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<div class={}>`   | `class="{}"`   | Braces are literal attribute value chars.                                                                                                                                                                                     |
| `<div class={  }>` | `class="{ }"`  | Spaces are literal too. Wait — actually result was `class="{ }"=""` — the space inside the unquoted value split it. Let me re-check: the DOM was `class="{ }"=""`. The `=` after `}` treats the whole thing differently. Hmm. |

Actually let me re-read carefully. The HTML is `<div class={  }>`. The parser sees:

1. `class=` — start attribute
2. `{` — unquoted value starts
3. `  ` — spaces in unquoted value? No — in unquoted attributes, spaces end the value.

Actually HTML spec says unquoted attribute values are terminated by whitespace. So `<div class={  }>`:

1. `class=`
2. `{` — unquoted value, terminated by space → value is `{`
3. `  ` — whitespace
4. `}` — new attribute name
5. `>` — end tag

But the DOM showed `class="{ }"=""`... Let me look again at the actual output.

From the DOM dump: `<div class="{" }="">` — so:

- `class="{"` — wait no. Let me look at innerHTML: `class="{\" }=\"\"` → `class="{ }"=""`. So the DOM attribute has value `{ }` and there's an additional attribute `=""`.

Hmm, let me just re-read the raw innerHTML: `<div class="{ }"="">`. This serializes as:

- class attr with value `{ }`
- empty attr with value `""`

So actually `{ }` became the class value. This means the browser treated `{` and `}` as part of an unquoted value and consumed everything up to the `>`. Let me verify...

Actually the innerHTML was: `<div class="{ }"="">`. The `"` after `{ }` is the closing quote... but where did the opening quote come from? The original input `<div class={  }>` has no quotes.

I think what happened is: the browser saw `class={`, then `}` as a new attribute name, then `>` ends the tag. But then the DOM serialization shows `class="{ }"=""` which doesn't match. Let me just move on and record what the browser actually produced.

**Let me just record the raw browser output without trying to explain the parsing in detail:**

| Input                           | Browser `innerHTML`                           |
| ------------------------------- | --------------------------------------------- |
| `class={}`                      | `class="{}"`                                  |
| `class={  }`                    | `class="{ }"=""`                              |
| `class={{a: 1}}`                | `class="{{a:" 1}}=""`                         |
| `class={unclosed`               | `class="{unclosed"`                           |
| `class={a}{b}`                  | `class="{a}{b}"`                              |
| `class={long expr}` (multiline) | `class="{ long expression }"=""` (simplified) |
| `class={" "}"`                  | `class="{"}"}` (complex parsing)              |
| `class={a < b}`                 | `class="{a" <= b}="">`                        |

### Key brace findings

- `{` and `}` are NOT special to the HTML parser — they're ordinary text characters.
- In unquoted attribute values, `{` and `}` are consumed like any other character.
- The browser will NOT interpret `class={expr}` as an expression — it's always a literal string.
- Unclosed `{` inside a tag has no special error recovery — the tag just ends at `>`.

### Braces outside tags

| Input                           | Browser Result                                          |
| ------------------------------- | ------------------------------------------------------- |
| `{just braces}`                 | **Text node** `{just braces}` — treated as plain text.  |
| `<div>text {with} braces</div>` | Text content `text {with} braces` — braces are literal. |

---

## 4. Self-Closing & Nesting (`case4-self-closing-nesting.html`)

### Void elements with closing tags

| Input       | Browser Result                                                                                              |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| `<br></br>` | Two `<br>` elements — the `</br>` is treated as a new opening `<br>` (not a closing tag for the first one). |

Actually let me re-read the DOM: `<br>` then `<br>` — yes, two separate `<br>` elements.

**RULE: `</br>` in HTML is treated as `<br>` (opening tag), NOT as a closing tag.**

### Custom elements self-closing

| Input             | Browser Result                                                                                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `<my-component/>` | `<my-component>` — **NOT self-closed**. In HTML, `/` before `>` is ignored for unknown elements. Everything after it becomes children. `<div>after custom self-close</div>` ends up INSIDE `<my-component>`. |

**CRITICAL RULE: `<foo/>` in HTML does NOT self-close custom/unknown elements. The `/` is ignored, and the element is left open. Only `<br>`, `<hr>`, `<img>`, `<input>`, `<link>`, `<meta>`, `<source>`, `<wbr>` (void elements) are effectively self-closing.**

### Script-like tags

| Input                                   | Browser Result                                                                                     |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `<fake-script>var x = 1;</fake-script>` | `<fake-script>` with text `var x = 1;` — parsed as a regular unknown element, not like `<script>`. |

### Misnested tags

| Input                           | Browser Result                                                                                       |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `<b><i>bold and italic</b></i>` | `<b><i>bold and italic</i></b>` — the browser **auto-closes** `<i>` before `<b>`, then closes `<b>`. |

**RULE: The browser uses the "adoption agency algorithm" to handle misnesting. It will restructure the DOM to ensure proper nesting.**

### Tag in attribute value

| Input                  | Browser Result                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `<div class="</div>">` | `class="</div>"` — the `</div>` inside the quoted value is literal text, NOT a closing tag. |

**RULE: `</` inside a quoted attribute value is literal text.**

### CDATA / Processing instructions / DOCTYPE in body

| Input                         | Browser Result                                                              |
| ----------------------------- | --------------------------------------------------------------------------- |
| `<![CDATA[ cdata content ]]>` | **Comment** `<!--[CDATA[ cdata content ]]-->` — treated as a bogus comment. |
| `<?xml version="1.0"?>`       | **Comment** `<!--?xml version="1.0"?-->` — bogus comment.                   |
| `<!DOCTYPE html>`             | **Empty** — DOCTYPE in body is ignored entirely.                            |

### Multiple root elements

| Input               | Browser Result                                                                                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two `<html>` blocks | Browser creates `<html>` → `<head><title>multi</title></head><body>A</body>` then adds second `<title>` and text "B" as siblings. The second `<html>` tag is effectively ignored. |

### SVG self-closing

| Input                         | Browser Result                                                                                                                                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<svg><circle r="10"/></svg>` | `<svg><circle r="10"></circle></svg>` — inside `<svg>`, self-closing works! `<circle/>` becomes `<circle>`. The HTML parser switches to **SVG parsing mode** inside `<svg>`, which supports self-closing for non-void elements. |

**RULE: Inside `<svg>`, `<math>`, or other foreign content elements, self-closing `/>` IS honored.**

### Template syntax in text

| Input                | Browser Result                                                   |
| -------------------- | ---------------------------------------------------------------- |
| `{{template}}`       | Text `{{template}}` — literal.                                   |
| `{{#if}}show{{/if}}` | Text `{{#if}}show{{/if}}` — literal.                             |
| `a < b > c`          | Text `a < b > c` — the `<` followed by space is text, not a tag. |

---

## 5. Sliz-Specific Cases (`case5-sliz-specific.html`)

### Spread attributes `{...props}`

| Input                | Browser Result                                                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<div {...props}>`   | `<div {...props}="">` — `{...props}` is parsed as an attribute name `{...props}` with value `""`. The `...` and braces are just part of the attribute name. |
| `<div { ...props }>` | `<div {="" ...props="" }="">` — the spaces cause `{`, `...props`, `}` to be parsed as three separate attributes.                                            |

**RULE: Braces are not special in attribute names. `{...props}` is just a (weird) attribute name.**

### Expression attribute without name

| Input          | Browser Result                                                     |
| -------------- | ------------------------------------------------------------------ |
| `<div {expr}>` | `<div {expr}="">` — `{expr}` is the attribute name, value is `""`. |

### Unclosed expression brace in tag

| Input             | Browser Result                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------- |
| `<div {unclosed>` | `<div {unclosed="">` — `{unclosed` is the attribute name, value is `""`. The tag ends at `>`. |

**RULE: Unclosed `{` in a tag does NOT cause special error recovery. The tag simply ends at `>`.**

### Fragment syntax `<>` and `<></>`

| Input                      | Browser Result                                                                   |
| -------------------------- | -------------------------------------------------------------------------------- |
| `<>text</>`                | Text `<>text` — the `<>` is text (`<` followed by `>` is not a valid tag start). |
| `<><div>fragment</div></>` | Text `<>` then `<div>fragment</div>` then text `</>` — `<>` and `</>` are text.  |

**RULE: `<>` is NOT a valid tag. `<` must be followed by an ASCII alpha or `/` to start a tag.**

### Tag starting with number

| Input                                  | Browser Result                                                                         |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| `<123div>`                             | Text `<123div>` — NOT a tag. `<` must be followed by ASCII alpha (or `/` for closing). |
| `<div123>`                             | Element `<div123>` — tag names CAN contain numbers, but must START with alpha.         |
| `<supercalifragilisticexpialidocious>` | Element with that name — tag names can be any length.                                  |

**RULE: Tag names must start with `[A-Za-z]`. Digits after the first character are fine.**

### Colon in attribute names

| Input                           | Browser Result                                                                                                                                  |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `<div class:active={isActive}>` | `class:active="{isActive}"` — the `:` is part of the attribute name, `{isActive}` is the unquoted value (which becomes `{isActive}` literally). |
| `<div v-if={show}>`             | `v-if="{show}"` — same, `-` is valid in attribute names.                                                                                        |

### Template syntax in attribute values

| Input               | Browser Result                                         |
| ------------------- | ------------------------------------------------------ |
| `<div key={value}>` | `key="{value}"` — `{value}` is literal unquoted value. |
| `<div id={id}>`     | `id="{id}"` — same.                                    |

**RULE: Template expression syntax `{...}` inside HTML attributes is treated as a literal string value by the browser.**

---

## Summary of Critical Rules for Sliz Tokenizer

### Tag Opening

1. **`<` + space/whitespace → TEXT, not a tag**. Only `<[A-Za-z]` or `</[A-Za-z]` starts a tag.
2. **`<>` → TEXT**. `<` + `>` is not a valid tag.
3. **`<123...` → TEXT**. Tag names must start with ASCII alpha.
4. **`</ space` → Bogus comment**. Closing tags must not have space after `</`.

### Tag Structure

5. **Missing `>` → tag still created**. Browser auto-closes at next valid boundary.
6. **Unclosed quote → consumes everything** until matching quote or tag end.
7. **`>` inside quoted attribute values is literal**.
8. **Attribute without `=` gets value `""`**.
9. **Duplicate attributes → first value wins**.
10. **Spaces around `=` are fine**.

### Self-Closing

11. **`<br/>`, `<br />` → `<br>`**. Void elements ignore `/>`.
12. **`<foo/>` for unknown elements → NOT self-closed in HTML**. The `/` is ignored.
13. **Inside `<svg>`/`<math>` → self-closing IS honored**.

### Braces (Critical for Sliz)

14. **`{` and `}` are ordinary characters** in HTML. Not special.
15. **`class={expr}` → `class="{expr}"`** — literal string value.
16. **Unclosed `{` in tag → tag ends at `>` with no special recovery**.
17. **`{{template}}` in text → literal text**.

### Closing Tags

18. **`</br>` → treated as `<br>` (opening)**, not a closing tag.
19. **`</ div>` → Bogus comment**.
20. **`</>` → text**.
21. **`</ my-comp>` → Bogus comment**.

### Error Recovery

22. **Unclosed tags → auto-closed at EOF**.
23. **Misnested tags → adoption agency algorithm restructures DOM**.
24. **CDATA/PI/DOCTYPE in body → comments or ignored**.
25. **Custom element self-closing → elements left open, children accumulate**.
