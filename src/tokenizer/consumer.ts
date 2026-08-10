import { DiagnosticCode, DiagnosticSeverity } from "../pipeline/context";
import char from "../scanner/char";
import { is } from "../scanner/is";
import { skip } from "../scanner/skip";
import { SyntaxKind, TokenizerContext } from "./token";

export namespace consume {

   export function attributes(ctx: TokenizerContext) {
      while (!ctx.cursor.eof) {
         const code = ctx.cursor.peek();

         if (
            code === char.greaterThan ||
            (code === char.slash && ctx.cursor.peek(1) === char.greaterThan)
         ) {
            return;
         }

         consume.attribute(ctx);
      }
   }


   export function attribute(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();

      while (!ctx.cursor.eof) {
         const code = ctx.cursor.peek();

         if (
            is.whitespace(code) ||
            code === char.equals ||
            code === char.greaterThan ||
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


      skip.whiteSpace(ctx.cursor)

      if (ctx.cursor.peek() !== char.equals) {
         return;
      }

      ctx.cursor.advance();
      skip.whiteSpace(ctx.cursor)
      consume.attributeValue(ctx);
   }



   export function attributeValue(ctx: TokenizerContext) {
      const code = ctx.cursor.peek();

      if (code === char.openBrace) {
         consume.expression(ctx);
         return;
      }

      if (
         code === char.singleQuote ||
         code === char.doubleQuote
      ) {
         consume.quotedAttributeValue(ctx);
         return;
      }

      consume.unquotedAttributeValue(ctx);
   }

  export  function quotedAttributeValue(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();
      const quote = ctx.cursor.peek();

      ctx.cursor.advance();

      while (!ctx.cursor.eof) {
         if (ctx.cursor.peek() === quote) {
            ctx.cursor.advance();

            ctx.tokens.push({
               kind: SyntaxKind.AttributeValue,
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
         end: ctx.cursor.position,
         message: "Unterminated attribute value",
         code: DiagnosticCode.UnterminatedAttributeValue,
         severity: DiagnosticSeverity.Error,
      });

      ctx.tokens.push({
         kind: SyntaxKind.AttributeValue,
         start: start.position,
         end: ctx.cursor.position,
         value: ctx.cursor.getChars(start),
      });

      ctx.cursor.advanceToEnd();
   }

  export  function unquotedAttributeValue(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();

      while (!ctx.cursor.eof) {
         const code = ctx.cursor.peek();

         if (
            is.whitespace(code) ||
            code === char.greaterThan ||
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




   export function closingTag(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();

      // Consume </
      ctx.cursor.advance();
      ctx.cursor.advance();


      const tagStart = ctx.cursor.clone();

      while (!ctx.cursor.eof) {
         const code = ctx.cursor.peek();

         if (
            is.whitespace(code) ||
            code === char.greaterThan
         ) {
            break;
         }

         ctx.cursor.advance();
      }

      if (ctx.cursor.position === tagStart.position) {
         ctx.diagnostics.push({
            start: start.position,
            end: ctx.cursor.position,
            message: "Expected tag name",
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
      skip.whiteSpace(ctx.cursor);
      consume.tagEnd(ctx);
   }


   /**
    * Reads an entire `<!DOCTYPE ...>` declaration until it finds the closing `>` character.
    * 
    * **How it works:**
    * 1. Remembers where the declaration starts.
    * 2. Advances character by character looking for the closing `>`:
    *    - **If found:** Saves a `Doctype` token and stops.
    * 3. **If `>` is never found (file ends early):** Adds an "Unterminated doctype" error message to `diagnostics`, saves whatever content was read as a `Doctype` token, and moves the cursor to the end of the file.
    * 
    * @param ctx The tokenizer context holding the cursor, error diagnostics, and token list.
    */
   export function doctype(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();

      while (!ctx.cursor.eof) {
         if (ctx.cursor.peek() === char.greaterThan) {
            ctx.cursor.advance();

            ctx.tokens.push({
               kind: SyntaxKind.Doctype,
               start: start.position,
               end: ctx.cursor.position,
               value: ctx.cursor.getChars(start),
            });

            break;
         }

         ctx.cursor.advance();
      }

      ctx.diagnostics.push({
         start: start.position,
         end: ctx.cursor.source.length,
         message: "Unterminated doctype",
         code: DiagnosticCode.UnterminatedDoctype,
         severity: DiagnosticSeverity.Error,
      });

      ctx.tokens.push({
         kind: SyntaxKind.Doctype,
         start: start.position,
         end: ctx.cursor.source.length,
         value: ctx.cursor.getChars(start),
      });

      ctx.cursor.advanceToEnd();
   }


   /**
    * Reads a JavaScript expression enclosed in curly braces like `{ name }` or `{ count + 1 }`.
    * 
    * **How it works:**
    * 1. Remembers where the opening `{` starts and advances past it.
    * 2. Uses `skip.braceExpression` to scan ahead and find the matching closing `}`.
    * 3. **If no closing `}` is found:** Reports an "Unterminated expression" error and grabs the rest of the file.
    * 4. **If a closing `}` is found:** Breaks the content down into three tokens:
    *    - Opening `{`
    *    - The JS expression code inside
    *    - Closing `}`
    * 
    * @param ctx The tokenizer context, which tracks cursor position, errors, and saved tokens.
    */
   export function expression(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();
      ctx.cursor.advance();

      const expressionStart = ctx.cursor.clone();
      const end = skip.braceExpression(ctx.cursor.source, start.position);

      if (end === -1) {
         ctx.diagnostics.push({
            start: start.position,
            end: ctx.cursor.source.length,
            message: "Unterminated expression",
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
            end: ctx.cursor.source.length,
            value: ctx.cursor.getChars(expressionStart),
         });

         ctx.cursor.advanceToEnd();
         return;
      }

      const closeBrace = end - 1;
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
         end,
         value: "}",
      });

      ctx.cursor.advanceTo(end);
   }

   /**
    * Reads an entire HTML comment starting from `<!--` until it reaches `-->` or the end of the file.
    * 
    * **How it works:**
    * 1. Remembers where the comment starts.
    * 2. Advances past the opening `<!--` sequence (4 characters).
    * 3. Loop through characters until it finds the closing `-->` sequence.
    * 4. Advances past `-->` and saves the complete comment as an `HtmlComment` token.
    * 
    * @param ctx The tokenizer context, which tracks cursor position and holds saved tokens.
    */
   export function htmlComment(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();

      ctx.cursor.advance(); // <
      ctx.cursor.advance(); // !
      ctx.cursor.advance(); // -
      ctx.cursor.advance(); // -

      while (!ctx.cursor.eof) {
         if (
            ctx.cursor.peek() === char.minus &&
            ctx.cursor.peek(1) === char.minus &&
            ctx.cursor.peek(2) === char.greaterThan
         ) {
            ctx.cursor.advance();
            ctx.cursor.advance();
            ctx.cursor.advance();
            break;
         }

         ctx.cursor.advance();
      }

      ctx.tokens.push({
         kind: SyntaxKind.HtmlComment,
         start: start.position,
         end: ctx.cursor.position,
         value: ctx.cursor.getChars(start),
      });
   }




   /**
    * Determines what kind of HTML tag or element starts at the current position 
    * and hands off processing to the right consumer function.
    * 
    * **How it works:**
    * 1. Checks if the code starts with `<!--` to handle HTML comments (`consumeHtmlComment`).
    * 2. Checks if the code starts with `<!DOCTYPE` or `<!doctype` to handle doctype declarations (`consumeDoctype`).
    * 3. Checks if the code starts with `</` to handle closing tags like `</div>` (`consumeClosingTag`).
    * 4. Otherwise, treats it as an opening tag like `<div>` (`consumeOpeningTag`).
    * 
    * @param ctx The tokenizer context holding the cursor position and token list.
    */
   export function markup(ctx: TokenizerContext) {
      const cursor = ctx.cursor;

      if (
         cursor.peek() === char.lessThan && cursor.peek(1) === char.exclamationMark
      ) {
         if (cursor.peek(2) === char.minus && cursor.peek(3) === char.minus) {
            consume.htmlComment(ctx);
            return;
         }

         if (is.doctype(ctx)) {
            consume.doctype(ctx);
            return;
         }
      }

      if (cursor.peek() === char.lessThan && cursor.peek(1) === char.slash) {
         consume.closingTag(ctx);
         return;
      }

      const tagName = consume.openingTag(ctx);

      if (tagName === "script") {
         consume.script(ctx)
         return
      }



      if (tagName === 'style') {
         consume.style(ctx)
      }

   }


   export function openingTag(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();
      ctx.cursor.advance();

      const tagStart = ctx.cursor.clone();

      while (!ctx.cursor.eof) {
         const code = ctx.cursor.peek();

         if (
            is.whitespace(code) ||
            code === char.greaterThan ||
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
            message: "Expected tag name",
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


      consume.attributes(ctx)
      consume.tagEnd(ctx)

      return tagName
   }



   export function script(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();

      while (!ctx.cursor.eof) {
         const code = ctx.cursor.peek();

         if (
            code === char.singleQuote ||
            code === char.doubleQuote
         ) {
            skip.string(ctx);
            continue;
         }

         if (code === char.backtick) {
            skip.template(ctx);
            continue;
         }

         if (
            code === char.slash &&
            ctx.cursor.peek(1) === char.slash
         ) {
            skip.lineComment(ctx);
            continue;
         }

         if (
            code === char.slash &&
            ctx.cursor.peek(1) === char.asterisk
         ) {
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

         ctx.cursor.advance();
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


   export function style(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();

      while (!ctx.cursor.eof) {
         const code = ctx.cursor.peek();

         // CSS strings
         if (
            code === char.singleQuote ||
            code === char.doubleQuote
         ) {
            skip.string(ctx);
            continue;
         }

         // CSS block comment
         if (
            code === char.slash &&
            ctx.cursor.peek(1) === char.asterisk
         ) {
            skip.blockComment(ctx);
            continue;
         }

         // Closing </style>
         if (
            code === char.lessThan &&
            ctx.cursor.peek(1) === char.slash &&
            is.styleClosingTag(ctx)
         ) {
            break;
         }

         ctx.cursor.advance();
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


   export function tagEnd(ctx: TokenizerContext) {
      const start = ctx.cursor.clone();
      // Self-closing tag: />
      if (
         ctx.cursor.peek() === char.slash &&
         ctx.cursor.peek(1) === char.greaterThan
      ) {
         ctx.cursor.advance();
         ctx.cursor.advance();

         ctx.tokens.push({
            kind: SyntaxKind.GreaterThan,
            start: start.position,
            end: ctx.cursor.position,
            value: "/>",
         });

         return;
      }

      // Normal tag: >
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
         message: "Expected '>'",
         code: DiagnosticCode.ExpectedTagEnd,
         severity: DiagnosticSeverity.Error,
      });

   }




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