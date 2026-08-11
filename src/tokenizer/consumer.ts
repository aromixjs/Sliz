import { DiagnosticCode, DiagnosticSeverity } from "../pipeline/context";
import char from "../scanner/char";
import { is } from "../scanner/is";
import { skip } from "../scanner/skip";
import { SyntaxKind, TokenizerContext } from "./token";

export namespace consume {

   /**
    * Reads all attributes on a tag until the closing `>` or `/>` is reached.
    *
    * **How it works:**
    * 1. Loops while not at EOF.
    * 2. If it encounters `>` or `/>`, the tag is done — returns immediately.
    * 3. If it encounters `<`, `{`, or bare `/` (not `/>`), the tag is malformed — returns immediately so the outer loop handles it.
    * 4. Skips whitespace between attributes.
    * 5. Otherwise, hands off to `consume.attribute` to read one attribute, then loops again.
    *
    * @param ctx The tokenizer context. Cursor must be positioned after the tag name.
    */
   export function attributes(ctx: TokenizerContext) {
      while (!ctx.cursor.eof) {
         const code = ctx.cursor.peek();

         if (is.tagEnd(ctx)) {
            return;
         }

         if (
            code === char.lessThan ||
            code === char.openBrace ||
            code === char.slash
         ) {
            return;
         }

         if (is.whitespace(code)) {
            skip.whiteSpace(ctx);
            continue;
         }

         consume.attribute(ctx);
      }
   }


   /**
    * Reads a single attribute: its name, optional `=` sign, and optional value.
    *
    * **How it works:**
    * 1. Remembers where the cursor started.
    * 2. Reads characters until whitespace, `=`, `>`, `<`, `{`, `/`, or EOF is hit — these are all sync points.
    * 3. **If no name was read** (cursor didn't move): returns early, nothing to emit.
    * 4. Saves the attribute name as an `AttributeName` token.
    * 5. Skips any whitespace after the name.
    * 6. If the next character is `=`, advances past it, skips whitespace, and hands off to `consume.attributeValue` to read the value.
    * 7. **If there is no `=`:** returns early — this is a boolean attribute like `disabled`.
    *
    * @param ctx The tokenizer context. Cursor must be positioned at the start of the attribute name.
    */
   export function attribute(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();

      while (!ctx.cursor.eof) {
         const code = ctx.cursor.peek();

         if (
            is.whitespace(code) ||
            code === char.equals ||
            is.tagEnd(ctx) ||
            code === char.lessThan ||
            code === char.openBrace ||
            code === char.slash
         ) {
            break;
         }

         ctx.cursor.advance();
      }

      if (ctx.cursor.position === start.position) {
         return;
      }

      ctx.tokens.push({
         kind: SyntaxKind.AttributeName,
         start: start.position,
         end: ctx.cursor.position,
         value: ctx.cursor.getChars(start),
      });

      skip.whiteSpace(ctx);

      if (ctx.cursor.peek() !== char.equals) {
         return;
      }

      ctx.cursor.advance();
      skip.whiteSpace(ctx);
      consume.attributeValue(ctx);
   }



   /**
    * Reads an attribute value after the `=` sign, dispatching to the right reader based on what character the value starts with.
    *
    * **How it works:**
    * 1. Peeks at the first character of the value.
    * 2. **If `{`:** reads it as a JS expression via `consume.expression`.
    * 3. **If `'` or `"`:** reads it as a quoted string via `consume.quotedAttributeValue`.
    * 4. **Otherwise:** reads it as an unquoted value via `consume.unquotedAttributeValue`.
    *
    * @param ctx The tokenizer context. Cursor must be positioned at the start of the value.
    */
   export function attributeValue(ctx: TokenizerContext) {
      const code = ctx.cursor.peek();

      if (code === char.openBrace) {
         consume.expression(ctx);
         return;
      }

      if (is.quote(code)) {
         consume.quotedAttributeValue(ctx);
         return;
      }

      consume.unquotedAttributeValue(ctx);
   }

   /**
    * Reads a quoted attribute value from the opening quote to the matching closing quote.
    *
    * **How it works:**
    * 1. Remembers the opening quote character and advances past it.
    * 2. Advances character by character looking for the matching closing quote:
    *    - **If `<` or `{` is found:** the value is malformed — stops scanning and reports an error. These are sync points.
    *    - **If found:** Saves an `AttributeValue` token (including the quotes) and stops.
    * 3. **If the closing quote is never found (file ends early):** Adds an "Unterminated attribute value" error message to `diagnostics`, saves whatever content was read as an `AttributeValue` token, and stops.
    *
    * @param ctx The tokenizer context. Cursor must be positioned at the opening quote.
    */
   export function quotedAttributeValue(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();
      const quote = ctx.cursor.peek();

      ctx.cursor.advance();

      while (!ctx.cursor.eof) {
         const code = ctx.cursor.peek();

         if (code === quote) {
            ctx.cursor.advance();

            ctx.tokens.push({
               kind: SyntaxKind.AttributeValue,
               start: start.position,
               end: ctx.cursor.position,
               value: ctx.cursor.getChars(start),
            });

            return;
         }

         if (
            code === char.lessThan ||
            code === char.openBrace
         ) {
            break;
         }

         ctx.cursor.advance();
      }

      ctx.diagnostics.push({
         start: start.position,
         end: ctx.cursor.position,
         message: "Unterminated attribute value — missing closing quote",
         code: DiagnosticCode.UnterminatedAttributeValue,
         severity: DiagnosticSeverity.Error,
      });

      ctx.tokens.push({
         kind: SyntaxKind.AttributeValue,
         start: start.position,
         end: ctx.cursor.position,
         value: ctx.cursor.getChars(start),
      });
   }

   /**
    * Reads an unquoted attribute value until whitespace, `>`, `<`, `{`, `/`, or EOF is hit.
    *
    * **How it works:**
    * 1. Remembers where the value starts.
    * 2. Advances character by character until a delimiter (whitespace, `>`, `<`, `{`, `/`, or EOF) is hit.
    * 3. **If no characters were consumed** (cursor didn't move): returns early, nothing to emit.
    * 4. Otherwise, saves the consumed characters as an `AttributeValue` token.
    *
    * @param ctx The tokenizer context. Cursor must be positioned at the start of the value.
    */
   export function unquotedAttributeValue(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();

      while (!ctx.cursor.eof) {
         const code = ctx.cursor.peek();

         if (
            is.whitespace(code) ||
            is.tagEnd(ctx) ||
            code === char.lessThan ||
            code === char.openBrace ||
            code === char.slash
         ) {
            break;
         }

         ctx.cursor.advance();
      }

      if (ctx.cursor.position === start.position) {
         return;
      }

      ctx.tokens.push({
         kind: SyntaxKind.AttributeValue,
         start: start.position,
         end: ctx.cursor.position,
         value: ctx.cursor.getChars(start),
      });

   }




   /**
    * Reads a closing tag like `</div>` or `</br>`.
    *
    * **How it works:**
    * 1. Remembers where the tag started, then advances past the `</` characters.
    * 2. Skips any whitespace between `</` and the tag name.
    * 3. Reads the tag name until whitespace, `>`, `<`, `{`, `/`, or EOF is hit — these are all sync points.
    * 4. **If no tag name was found:** Adds an "Expected tag name" error to `diagnostics`, advances past one character, and returns.
    * 5. Emits three tokens: `LessThan` for `<`, `Slash` for `/`, and `TagName` for the tag name.
    * 6. Skips any whitespace after the tag name.
    * 7. Calls `consume.tagEnd` to read the closing `>` or `/>`.
    * 8. **If `tagEnd` fails:** Advances past the problematic character so the outer loop can continue.
    *
    * @param ctx The tokenizer context. Cursor must be positioned at the `<` of the closing tag.
    */
   export function closingTag(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();
      ctx.cursor.advance();
      ctx.cursor.advance();

      skip.whiteSpace(ctx);

      const tagStart = ctx.cursor.clone();

      while (!ctx.cursor.eof) {
         const code = ctx.cursor.peek();

         if (
            is.whitespace(code) ||
            is.tagEnd(ctx) ||
            code === char.lessThan ||
            code === char.openBrace ||
            code === char.slash
         ) {
            break;
         }

         ctx.cursor.advance();
      }

      if (ctx.cursor.position === tagStart.position) {
         ctx.diagnostics.push({
            start: start.position,
            end: ctx.cursor.position,
            message: "Expected tag name after '</'",
            code: DiagnosticCode.ExpectedTagName,
            severity: DiagnosticSeverity.Error,
         });

         ctx.cursor.advanceTo(ctx.cursor.position + 1);
         return;
      }

      ctx.tokens.push({
         kind: SyntaxKind.LessThan,
         start: start.position,
         end: start.position + 1,
         value: "<",
      });

      ctx.tokens.push({
         kind: SyntaxKind.Slash,
         start: start.position + 1,
         end: start.position + 2,
         value: "/",
      });

      ctx.tokens.push({
         kind: SyntaxKind.TagName,
         start: tagStart.position,
         end: ctx.cursor.position,
         value: ctx.cursor.getChars(tagStart),
      });

      skip.whiteSpace(ctx);

      const tagEndStart = ctx.cursor.position;
      consume.tagEnd(ctx);

      if (ctx.cursor.position === tagEndStart) {
         ctx.cursor.advance();
      }
   }


   /**
    * Reads a `<!DOCTYPE ...>` declaration until the closing `>` is found, a `<` is hit, or the end of the file.
    *
    * **How it works:**
    * 1. Remembers where the declaration starts.
    * 2. Advances character by character looking for the closing `>`:
    *    - **If `'` or `"` is found:** skips over the entire quoted string so `>` inside quotes is ignored.
    *    - **If unquoted `>` is found:** saves a `Doctype` token and stops.
    *    - **If `<` is found:** the doctype is malformed — stops scanning and reports an error.
    * 3. **If `>` is never found:** Adds an "Unterminated doctype" error to `diagnostics`, saves whatever was read as a `Doctype` token, and stops.
    *
    * @param ctx The tokenizer context holding the cursor, error diagnostics, and token list.
    */
   export function doctype(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();

      while (!ctx.cursor.eof) {
         const code = ctx.cursor.peek();

         if (is.quote(code)) {
            skip.string(ctx);
            continue;
         }

         if (code === char.greaterThan) {
            ctx.cursor.advance();

            ctx.tokens.push({
               kind: SyntaxKind.Doctype,
               start: start.position,
               end: ctx.cursor.position,
               value: ctx.cursor.getChars(start),
            });

            return;
         }

         if (code === char.lessThan) {
            break;
         }

         ctx.cursor.advance();
      }

      ctx.diagnostics.push({
         start: start.position,
         end: ctx.cursor.position,
         message: "Unterminated doctype declaration — expected '>' before next '<'",
         code: DiagnosticCode.UnterminatedDoctype,
         severity: DiagnosticSeverity.Error,
      });

      ctx.tokens.push({
         kind: SyntaxKind.Doctype,
         start: start.position,
         end: ctx.cursor.position,
         value: ctx.cursor.getChars(start),
      });
   }


   /**
    * Reads a JavaScript expression enclosed in curly braces like `{ name }` or `{ count + 1 }`.
    *
    * How it works:
    * 1. Remembers where the opening `{` starts and advances past it.
    * 2. Uses `skip.braceExpression` to scan ahead and find the matching closing `}`.
    *    - `skip.braceExpression` stops at `}`, `</` (closing tag), or EOF.
    * 3. **If `</` is found:** the expression is malformed — adds an "Unterminated expression" error, saves partial tokens, and stops. Cursor stays at `<` so the outer loop handles the closing tag.
    * 4. **If EOF is reached:** adds an "Unterminated expression" error, saves partial tokens, and stops.
    * 5. **If `}` is found:** saves three tokens: the opening `{`, the expression content, and the closing `}`.
    *
    * @param ctx The tokenizer context, which tracks cursor position, errors, and saved tokens.
    */
   export function expression(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();
      ctx.cursor.advance();

      const expressionStart = ctx.cursor.clone();
      skip.braceExpression(ctx);

      const isUnterminated = ctx.cursor.eof || (
         ctx.cursor.peek() === char.lessThan &&
         ctx.cursor.peek(1) === char.slash
      );

      if (isUnterminated) {
         ctx.diagnostics.push({
            start: start.position,
            end: ctx.cursor.position,
            message: "Unterminated expression — expected '}' before '</' or end of file",
            code: DiagnosticCode.UnterminatedExpression,
            severity: DiagnosticSeverity.Error,
         });

         ctx.tokens.push({
            kind: SyntaxKind.OpenBrace,
            start: start.position,
            end: start.position + 1,
            value: "{",
         });

         ctx.tokens.push({
            kind: SyntaxKind.JsExpression,
            start: expressionStart.position,
            end: ctx.cursor.position,
            value: ctx.cursor.getChars(expressionStart),
         });

         return;
      }

      const closeBrace = ctx.cursor.position - 1;

      ctx.tokens.push({
         kind: SyntaxKind.OpenBrace,
         start: start.position,
         end: start.position + 1,
         value: "{",
      });

      ctx.tokens.push({
         kind: SyntaxKind.JsExpression,
         start: expressionStart.position,
         end: closeBrace,
         value: ctx.cursor.source.slice(expressionStart.position, closeBrace),
      });

      ctx.tokens.push({
         kind: SyntaxKind.CloseBrace,
         start: closeBrace,
         end: ctx.cursor.position,
         value: "}",
      });
   }

   /**
    * Reads an HTML comment starting from `<!--` until `-->` is found or the end of the file.
    *
    * **How it works:**
    * 1. Remembers where the comment starts.
    * 2. Advances past the opening `<!--` sequence (4 characters).
    * 3. Loops through characters:
    *    - **If `<!--` is found inside the comment:** HTML doesn't support nested comments — adds a "Nested comment" error and keeps scanning.
    *    - **If `-->` is found:** the comment is done — saves an `HtmlComment` token and stops.
    * 4. **If `-->` is never found (file ends early):** Adds an "Unterminated comment" error and saves whatever was read as an `HtmlComment` token.
    *
    * @param ctx The tokenizer context. Cursor must be positioned at the `<` of the comment.
    */
   export function htmlComment(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();

      ctx.cursor.advance();
      ctx.cursor.advance();
      ctx.cursor.advance();
      ctx.cursor.advance();

      while (!ctx.cursor.eof) {

         if (is.commentOpen(ctx)) {
            ctx.diagnostics.push({
               start: ctx.cursor.position,
               end: ctx.cursor.position + 4,
               message: "Nested comment — HTML does not support nested comments",
               code: DiagnosticCode.NestedComment,
               severity: DiagnosticSeverity.Error,
            });

            ctx.cursor.advance();
            ctx.cursor.advance();
            ctx.cursor.advance();
            ctx.cursor.advance();
            continue;
         }

         if (is.commentClose(ctx)) {
            ctx.cursor.advance();
            ctx.cursor.advance();
            ctx.cursor.advance();

            ctx.tokens.push({
               kind: SyntaxKind.HtmlComment,
               start: start.position,
               end: ctx.cursor.position,
               value: ctx.cursor.getChars(start),
            });

            return;
         }

         ctx.cursor.advance();
      }

      ctx.diagnostics.push({
         start: start.position,
         end: ctx.cursor.source.length,
         message: "Unterminated comment — expected '-->' before end of file",
         code: DiagnosticCode.UnterminatedComment,
         severity: DiagnosticSeverity.Error,
      });

      ctx.tokens.push({
         kind: SyntaxKind.HtmlComment,
         start: start.position,
         end: ctx.cursor.source.length,
         value: ctx.cursor.getChars(start),
      });
   }




   /**
    * Determines what kind of HTML tag or element starts at the current position
    * and hands off processing to the right consumer function.
    *
    * **How it works:**
    * 1. If the cursor is at `<!--`, hands off to `consume.htmlComment`.
    * 2. If the cursor is at `<!DOCTYPE`, hands off to `consume.doctype`.
    * 3. If the cursor is at `</`, hands off to `consume.closingTag`.
    * 4. Otherwise, treats it as an opening tag and hands off to `consume.openingTag`.
    *
    * @param ctx The tokenizer context holding the cursor position and token list.
    */
   export function markup(ctx: TokenizerContext) {
      if (is.commentOpen(ctx)) {
         consume.htmlComment(ctx);
         return;
      }

      if (is.doctype(ctx)) {
         consume.doctype(ctx);
         return;
      }

      if (is.closingTagStart(ctx)) {
         consume.closingTag(ctx);
         return;
      }

      const tagName = consume.openingTag(ctx);

      if (tagName === "script") {
         consume.script(ctx);
         return;
      }

      if (tagName === "style") {
         consume.style(ctx);
         return;
      }
   }


   /**
    * Reads an opening tag like `<div>` or `<br/>`, returning its name for further dispatch.
    *
    * **How it works:**
    * 1. Remembers where the tag started, then advances past the `<` character.
    * 2. Skips any whitespace between `<` and the tag name.
    * 3. Reads the tag name until whitespace, `>`, `<`, `{`, `/`, or EOF is hit — these are all sync points.
    * 4. **If no tag name was found:** Adds an "Expected tag name" error to `diagnostics`, advances past one character, and returns `undefined`.
    * 5. Emits a `LessThan` token for `<` and a `TagName` token for the tag name.
    * 6. Calls `consume.attributes` to read all attributes on the tag.
    * 7. Calls `consume.tagEnd` to read the closing `>` or `/>`.
    * 8. **If `tagEnd` fails:** Advances past the problematic character so the outer loop can continue.
    * 9. Returns the lowercased tag name so callers can dispatch on it (e.g., `"script"` or `"style"`).
    *
    * @param ctx The tokenizer context. Cursor must be positioned at the `<` of the opening tag.
    * @returns The lowercased tag name, or `undefined` if no tag name was found.
    */
   export function openingTag(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();
      ctx.cursor.advance();

      skip.whiteSpace(ctx);

      const tagStart = ctx.cursor.clone();

      while (!ctx.cursor.eof) {
         const code = ctx.cursor.peek();

         if (
            is.whitespace(code) ||
            is.tagEnd(ctx) ||
            code === char.lessThan ||
            code === char.openBrace ||
            code === char.slash
         ) {
            break;
         }

         ctx.cursor.advance();
      }

      if (ctx.cursor.position === tagStart.position) {
         ctx.diagnostics.push({
            start: start.position,
            end: ctx.cursor.position,
            message: "Expected tag name after '<'",
            code: DiagnosticCode.ExpectedTagName,
            severity: DiagnosticSeverity.Error,
         });

         ctx.cursor.advanceTo(ctx.cursor.position + 1);
         return;
      }

      const tagName = ctx.cursor.getChars(tagStart).toLowerCase();

      ctx.tokens.push({
         kind: SyntaxKind.LessThan,
         start: start.position,
         end: tagStart.position,
         value: "<",
      });

      ctx.tokens.push({
         kind: SyntaxKind.TagName,
         start: tagStart.position,
         end: ctx.cursor.position,
         value: ctx.cursor.getChars(tagStart),
      });

      consume.attributes(ctx);

      const tagEndStart = ctx.cursor.position;
      consume.tagEnd(ctx);

      if (ctx.cursor.position === tagEndStart) {
         ctx.cursor.advance();
      }

      return tagName;
   }



   /**
    * Reads the raw content of a `<script>` tag until the closing `</script>` tag is found.
    *
    * **How it works:**
    * 1. Remembers where the script content starts.
    * 2. Advances character by character, skipping over anything that could contain `</script>` by accident:
    *    - **Single or double quotes:** skips the entire string via `skip.string`.
    *    - **Backticks:** skips the entire template literal via `skip.template`.
    *    - **`//`:** skips the entire line comment via `skip.lineComment`.
    *    - **`/*`:** skips the entire block comment via `skip.blockComment`.
    * 3. If it encounters `</script>` (case-insensitive), stops — the script content is done.
    * 4. If it encounters `<` (not `</script>`), the script is malformed — stops scanning and reports an error.
    * 5. **If EOF is reached without `</script>`:** Adds an "Unterminated script" error.
    * 6. **If anything was read:** saves the raw content as a `Script` token.
    *
    * @param ctx The tokenizer context. Cursor must be positioned right after the opening `<script>` tag.
    */
   export function script(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();

      while (!ctx.cursor.eof) {
         const code = ctx.cursor.peek();

         if (is.quote(code)) {
            skip.string(ctx);
            continue;
         }

         if (code === char.backtick) {
            skip.template(ctx);
            continue;
         }

         if (is.lineCommentStart(ctx)) {
            skip.lineComment(ctx);
            continue;
         }

         if (is.blockCommentStart(ctx)) {
            skip.blockComment(ctx);
            continue;
         }

         if (
            code === char.lessThan &&
            ctx.cursor.peek(1) === char.slash &&
            is.scriptClosingTag(ctx)
         ) {
            break;
         }

         if (code === char.lessThan) {
            ctx.diagnostics.push({
               start: start.position,
               end: ctx.cursor.position,
               message: "Unterminated script — unexpected '<' before '</script>'",
               code: DiagnosticCode.UnterminatedScript,
               severity: DiagnosticSeverity.Error,
            });

            ctx.tokens.push({
               kind: SyntaxKind.Script,
               start: start.position,
               end: ctx.cursor.position,
               value: ctx.cursor.getChars(start),
            });

            return;
         }

         ctx.cursor.advance();
      }

      if (ctx.cursor.eof) {
         if (ctx.cursor.position > start.position) {
            ctx.diagnostics.push({
               start: start.position,
               end: ctx.cursor.position,
               message: "Unterminated script — expected '</script>' before end of file",
               code: DiagnosticCode.UnterminatedScript,
               severity: DiagnosticSeverity.Error,
            });

            ctx.tokens.push({
               kind: SyntaxKind.Script,
               start: start.position,
               end: ctx.cursor.position,
               value: ctx.cursor.getChars(start),
            });
         }

         return;
      }

      if (ctx.cursor.position > start.position) {
         ctx.tokens.push({
            kind: SyntaxKind.Script,
            start: start.position,
            end: ctx.cursor.position,
            value: ctx.cursor.getChars(start),
         });
      }
   }


   /**
    * Reads the raw content of a `<style>` tag until the closing `</style>` tag is found.
    *
    * **How it works:**
    * 1. Remembers where the style content starts.
    * 2. Advances character by character, skipping over anything that could contain `</style>` by accident:
    *    - **Single or double quotes:** skips the entire string via `skip.string`.
    *    - **`/*`:** skips the entire block comment via `skip.blockComment`.
    * 3. If it encounters `</style>` (case-insensitive), stops — the style content is done.
    * 4. If it encounters `<` (not `</style>`), the style is malformed — stops scanning and reports an error.
    * 5. **If EOF is reached without `</style>`:** Adds an "Unterminated style" error.
    * 6. **If anything was read:** saves the raw content as a `Style` token.
    *
    * @param ctx The tokenizer context. Cursor must be positioned right after the opening `<style>` tag.
    */
   export function style(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();

      while (!ctx.cursor.eof) {
         const code = ctx.cursor.peek();

         if (is.quote(code)) {
            skip.string(ctx);
            continue;
         }

         if (is.blockCommentStart(ctx)) {
            skip.blockComment(ctx);
            continue;
         }

         if (
            code === char.lessThan &&
            ctx.cursor.peek(1) === char.slash &&
            is.styleClosingTag(ctx)
         ) {
            break;
         }

         if (code === char.lessThan) {
            ctx.diagnostics.push({
               start: start.position,
               end: ctx.cursor.position,
               message: "Unterminated style — unexpected '<' before '</style>'",
               code: DiagnosticCode.UnterminatedStyle,
               severity: DiagnosticSeverity.Error,
            });

            ctx.tokens.push({
               kind: SyntaxKind.Style,
               start: start.position,
               end: ctx.cursor.position,
               value: ctx.cursor.getChars(start),
            });

            return;
         }

         ctx.cursor.advance();
      }

      if (ctx.cursor.eof) {
         if (ctx.cursor.position > start.position) {
            ctx.diagnostics.push({
               start: start.position,
               end: ctx.cursor.position,
               message: "Unterminated style — expected '</style>' before end of file",
               code: DiagnosticCode.UnterminatedStyle,
               severity: DiagnosticSeverity.Error,
            });

            ctx.tokens.push({
               kind: SyntaxKind.Style,
               start: start.position,
               end: ctx.cursor.position,
               value: ctx.cursor.getChars(start),
            });
         }

         return;
      }

      if (ctx.cursor.position > start.position) {
         ctx.tokens.push({
            kind: SyntaxKind.Style,
            start: start.position,
            end: ctx.cursor.position,
            value: ctx.cursor.getChars(start),
         });
      }
   }


   /**
    * Reads the closing `>` or `/>` of a tag.
    *
    * **How it works:**
    * 1. Remembers where the cursor started.
    * 2. **If the next two characters are `/>`:** advances past both and saves a `SlashGreaterThan` token.
    * 3. **If the next character is `>`:** advances past it and saves a `GreaterThan` token.
    * 4. **If neither is found:** Adds an "Expected '>'" error to `diagnostics` — cursor stays so caller can advance.
    *
    * @param ctx The tokenizer context. Cursor must be positioned at the `>` or `/>` of the tag.
    */
   export function tagEnd(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();

      if (
         ctx.cursor.peek() === char.slash &&
         ctx.cursor.peek(1) === char.greaterThan
      ) {
         ctx.cursor.advance();
         ctx.cursor.advance();

         ctx.tokens.push({
            kind: SyntaxKind.SlashGreaterThan,
            start: start.position,
            end: ctx.cursor.position,
            value: "/>",
         });

         return;
      }

      if (ctx.cursor.peek() === char.greaterThan) {
         ctx.cursor.advance();

         ctx.tokens.push({
            kind: SyntaxKind.GreaterThan,
            start: start.position,
            end: ctx.cursor.position,
            value: ">",
         });

         return;
      }

      ctx.diagnostics.push({
         start: start.position,
         end: ctx.cursor.position,
         message: "Expected '>' to close the tag",
         code: DiagnosticCode.ExpectedTagEnd,
         severity: DiagnosticSeverity.Error,
      });

   }




   /**
    * Reads plain text content until it hits a `<` or `{` character.
    *
    * **How it works:**
    * 1. Remembers where the text starts.
    * 2. Advances character by character until it encounters `<` (markup) or `{` (expression).
    * 3. If no characters were consumed, returns without emitting a token.
    * 4. Otherwise, saves the consumed characters as a `Text` token.
    *
    * @param ctx The tokenizer context holding the cursor and token list.
    */
   export function text(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();

      while (!ctx.cursor.eof) {
         const code = ctx.cursor.peek();

         if (code === char.lessThan || code === char.openBrace) {
            break;
         }

         ctx.cursor.advance();
      }

      if (ctx.cursor.position === start.position) {
         return;
      }

      ctx.tokens.push({
         kind: SyntaxKind.Text,
         start: start.position,
         end: ctx.cursor.position,
         value: ctx.cursor.getChars(start),
      });
   }



}
