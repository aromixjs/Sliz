import { TokenizerContext } from "../token";

export function whiteSpace(ctx: TokenizerContext) {
   const start = ctx.cursor.clone();
   skip.whiteSpace(ctx);
   if (ctx.cursor.position > start.position) {
      ctx.emit({
         kind: TokenType.Whitespace,
         start: start.position,
         end: ctx.cursor.position,
         value: ctx.cursor.getChars(start),
      });
   }
}

/**
 * Reads all attributes on a tag until the closing `>` or `/>` is reached.
 */
export function attributes(ctx: TokenizerContext) {
   while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      if (is.tagEnd(ctx)) {
         return;
      }

      if (
         code === char.openBrace ||
         code === char.closeBrace ||
         code === char.slash
      ) {
         return;
      }

      if (is.whitespace(code)) {
         consume.whiteSpace(ctx);
         continue;
      }

      const before = ctx.cursor.position;
      consume.attribute(ctx);

      if (ctx.cursor.position === before) {
         ctx.emit({
            kind: TokenType.UnexpectedCharacter,
            start: ctx.cursor.position,
            end: ctx.cursor.position + 1,
            value: String.fromCharCode(code),
         });
         ctx.cursor.advance();
      }
   }
}


/**
 * Reads a single attribute: its name, optional `=` sign, and optional value.
 */
export function attribute(ctx: TokenizerContext) {
   const start = ctx.cursor.clone();

   while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      if (
         !is.attributeNameChar(code) ||
         code === char.equals ||
         is.tagEnd(ctx)
      ) {
         break;
      }

      ctx.cursor.advance();
   }

   if (ctx.cursor.position === start.position) {
      return;
   }

   ctx.emit({
      kind: TokenType.AttributeName,
      start: start.position,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(start),
   });

   consume.whiteSpace(ctx);

   if (ctx.cursor.peek() !== char.equals) {
      return;
   }

   const equalsStart = ctx.cursor.position;
   ctx.cursor.advance();

   ctx.emit({
      kind: TokenType.Equals,
      start: equalsStart,
      end: ctx.cursor.position,
      value: "=",
   });

   consume.whiteSpace(ctx);
   consume.attributeValue(ctx);
}



/**
 * Reads an attribute value after the `=` sign, dispatching to the right reader.
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
 * Browser behavior: unclosed quote consumes everything until matching quote or EOF.
 * `<` and `{` inside quoted values are literal — they do NOT end the value.
 */
export function quotedAttributeValue(ctx: TokenizerContext) {
   const start = ctx.cursor.clone();
   const quote = ctx.cursor.peek();

   ctx.cursor.advance();

   while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      if (code === quote) {
         ctx.cursor.advance();

         ctx.emit({
            kind: TokenType.AttributeValue,
            start: start.position,
            end: ctx.cursor.position,
            value: ctx.cursor.getChars(start),
         });

         return;
      }

      ctx.cursor.advance();
   }

   ctx.emit({
      kind: TokenType.AttributeValue,
      start: start.position,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(start),
   });

   ctx.emit({
      kind: TokenType.UnterminatedString,
      start: start.position,
      end: ctx.cursor.position,
   });
}

/**
 * Reads an unquoted attribute value until whitespace, `>`, `{`, or EOF.
 * Browser: unquoted values are terminated by whitespace or `>`.
 * `<` and `/` inside unquoted values are literal characters.
 */
export function unquotedAttributeValue(ctx: TokenizerContext) {
   const start = ctx.cursor.clone();

   while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      if (
         is.whitespace(code) ||
         is.tagEnd(ctx) ||
         code === char.openBrace
      ) {
         break;
      }

      ctx.cursor.advance();
   }

   if (ctx.cursor.position === start.position) {
      return;
   }

   ctx.emit({
      kind: TokenType.AttributeValue,
      start: start.position,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(start),
   });

}




/**
 * Reads a closing tag like `</div>` or `</br>`.
 * Browser: `</` must be immediately followed by tag name (alpha), no space.
 */
export function closingTag(ctx: TokenizerContext) {
   const start = ctx.cursor.clone();
   ctx.cursor.advance();
   ctx.cursor.advance();

   ctx.emit({
      kind: TokenType.LessThan,
      start: start.position,
      end: start.position + 1,
      value: "<",
   });

   ctx.emit({
      kind: TokenType.Slash,
      start: start.position + 1,
      end: start.position + 2,
      value: "/",
   });

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
      ctx.emit({
         kind: TokenType.ExpectedTagName,
         start: ctx.cursor.position,
         end: ctx.cursor.position,
      });

      consume.tagEnd(ctx);
      return;
   }

   ctx.emit({
      kind: TokenType.TagName,
      start: tagStart.position,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(tagStart),
   });

   consume.whiteSpace(ctx);

   consume.tagEnd(ctx);
}


/**
 * Reads a `<!DOCTYPE ...>` declaration until the closing `>` is found.
 */
export function doctype(ctx: TokenizerContext) {
   const start = ctx.cursor.clone();

   ctx.cursor.advance();
   ctx.cursor.advance();
   ctx.cursor.advance();
   ctx.cursor.advance();
   ctx.cursor.advance();
   ctx.cursor.advance();
   ctx.cursor.advance();
   ctx.cursor.advance();
   ctx.cursor.advance();

   while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      if (is.quote(code)) {
         skip.string(ctx.cursor);
         continue;
      }

      if (code === char.greaterThan) {
         ctx.cursor.advance();

         ctx.emit({
            kind: TokenType.Doctype,
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

   ctx.emit({
      kind: TokenType.Doctype,
      start: start.position,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(start),
   });

   ctx.emit({
      kind: TokenType.UnterminatedDoctype,
      start: start.position,
      end: ctx.cursor.position,
   });
}


/**
 * Reads an HTML comment starting from `<!--` until `-->` is found.
 */
export function htmlComment(ctx: TokenizerContext) {
   const start = ctx.cursor.clone();

   ctx.cursor.advance();
   ctx.cursor.advance();
   ctx.cursor.advance();
   ctx.cursor.advance();

   while (!ctx.cursor.eof) {

      if (is.commentOpen(ctx)) {
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

         ctx.emit({
            kind: TokenType.HtmlComment,
            start: start.position,
            end: ctx.cursor.position,
            value: ctx.cursor.getChars(start),
         });

         return;
      }

      ctx.cursor.advance();
   }

   ctx.emit({
      kind: TokenType.HtmlComment,
      start: start.position,
      end: ctx.cursor.source.length,
      value: ctx.cursor.getChars(start),
   });

   ctx.emit({
      kind: TokenType.UnterminatedComment,
      start: start.position,
      end: ctx.cursor.source.length,
   });
}

/**
 * Reads an opening tag like `<div>` or `<br/>`, returning its name for further dispatch.
 * Browser: `<` must be immediately followed by tag name (alpha), no space.
 */
export function openingTag(ctx: TokenizerContext) {
   const start = ctx.cursor.clone();
   ctx.cursor.advance();

   ctx.emit({
      kind: TokenType.LessThan,
      start: start.position,
      end: start.position + 1,
      value: "<",
   });

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
      ctx.emit({
         kind: TokenType.ExpectedTagName,
         start: ctx.cursor.position,
         end: ctx.cursor.position,
      });

      consume.tagEnd(ctx);
      return;
   }

   const tagName = ctx.cursor.getChars(tagStart).toLowerCase();

   ctx.emit({
      kind: TokenType.TagName,
      start: tagStart.position,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(tagStart),
   });

   consume.attributes(ctx);

   consume.tagEnd(ctx);

   return tagName;
}



/**
 * Reads the raw content of a `<script>` tag until `</script>` is found.
 */
export function script(ctx: TokenizerContext) {
   const start = ctx.cursor.clone();

   while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      if (is.quote(code)) {
         skip.string(ctx.cursor);
         continue;
      }

      if (code === char.backtick) {
         skip.template(ctx.cursor);
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

      ctx.cursor.advance();
   }

   if (ctx.cursor.eof) {
      ctx.emit({
         kind: TokenType.UnterminatedScript,
         start: start.position,
         end: ctx.cursor.position,
      });
   }

   if (ctx.cursor.position > start.position) {
      ctx.emit({
         kind: TokenType.Script,
         start: start.position,
         end: ctx.cursor.position,
         value: ctx.cursor.getChars(start),
      });
   }
}


/**
 * Reads the raw content of a `<style>` tag until `</style>` is found.
 */
export function style(ctx: TokenizerContext) {
   const start = ctx.cursor.clone();

   while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      if (is.quote(code)) {
         skip.string(ctx.cursor);
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

      ctx.cursor.advance();
   }

   if (ctx.cursor.eof) {
      ctx.emit({
         kind: TokenType.UnterminatedStyle,
         start: start.position,
         end: ctx.cursor.position,
      });
   }

   if (ctx.cursor.position > start.position) {
      ctx.emit({
         kind: TokenType.Style,
         start: start.position,
         end: ctx.cursor.position,
         value: ctx.cursor.getChars(start),
      });
   }
}


/**
 * Reads the closing `>` or `/>` of a tag.
 * Emits UnexpectedCharacter for any unexpected chars before the closing delimiter.
 */
export function tagEnd(ctx: TokenizerContext) {
   while (!ctx.cursor.eof) {
      const start = ctx.cursor.clone();

      if (
         ctx.cursor.peek() === char.slash &&
         ctx.cursor.peek(1) === char.greaterThan
      ) {
         ctx.cursor.advance();
         ctx.cursor.advance();

         ctx.emit({
            kind: TokenType.SlashGreaterThan,
            start: start.position,
            end: ctx.cursor.position,
            value: "/>",
         });

         return;
      }

      if (ctx.cursor.peek() === char.greaterThan) {
         ctx.cursor.advance();

         ctx.emit({
            kind: TokenType.GreaterThan,
            start: start.position,
            end: ctx.cursor.position,
            value: ">",
         });

         return;
      }

      ctx.emit({
         kind: TokenType.UnexpectedCharacter,
         start: ctx.cursor.position,
         end: ctx.cursor.position + 1,
         value: String.fromCharCode(ctx.cursor.peek()),
      });

      ctx.cursor.advance();
   }
}



/*======  These Are Trigger Consumers  =====*/

// Determines what kind of HTML tag or element starts at the current position.
export function consumeMarkup(ctx: TokenizerContext) {
   // if (is.commentOpen(ctx)) {
   //    consume.htmlComment(ctx);
   //    return;
   // }

   // if (is.doctype(ctx)) {
   //    consume.doctype(ctx);
   //    return;
   // }

   // if (is.closingTagStart(ctx)) {
   //    consume.closingTag(ctx);
   //    return;
   // }

   // const tagName = consume.openingTag(ctx);

   // if (tagName === "script") {
   //    consume.script(ctx);
   //    return;
   // }

   // if (tagName === "style") {
   //    consume.style(ctx);
   //    return;
   // }
}




