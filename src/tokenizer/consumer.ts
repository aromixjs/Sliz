import char from "../scanner/char";
import { is } from "../scanner/is";
import { TokenizerContext, TokenType } from "./token";

export namespace consume {
  export const templateLiteral = (ctx: TokenizerContext) => {
    const start = ctx.cursor.position;
    // Consume opening backtick.
    ctx.cursor.advance();
    ctx.emit({
      type: TokenType.BackTick,
      start,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(start),
    });

    // Start of the current static template text chunk.
    let chunkStart = ctx.cursor.position;
    while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      // Skip escaped characters
      if (code === char.backslash) {
        ctx.cursor.advance();

        if (!ctx.cursor.eof) {
          ctx.cursor.advance();
        }

        continue;
      }

      // Template interpolation: ${ ... }
      if (code === char.dollar && ctx.cursor.peekAtOffset(1) === char.openBrace) {
        // Emit the static text preceding the interpolation.
        ctx.emitIf(chunkStart < ctx.cursor.position, {
          type: TokenType.JsString,
          start: chunkStart,
          end: ctx.cursor.position,
          value: ctx.cursor.getChars(chunkStart),
        });

        consume.templateExpression(ctx);
        chunkStart = ctx.cursor.position;
        continue;
      }

      // Template closed successfully.
      if (code === char.backtick) {
        ctx.emitIf(chunkStart < ctx.cursor.position, {
          type: TokenType.JsString,
          start: chunkStart,
          end: ctx.cursor.position,
          value: ctx.cursor.getChars(chunkStart),
        });

        const endStart = ctx.cursor.position;
        ctx.cursor.advance();
        ctx.emit({
          type: TokenType.BackTick,
          start: endStart,
          end: ctx.cursor.position,
          value: ctx.cursor.getChars(endStart),
        });

        return;
      }

      ctx.cursor.advance();
    }

    // ran Out Of Input Before The string closed
    ctx.emitIf(chunkStart < ctx.cursor.position, {
      type: TokenType.JsString,
      start: chunkStart,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(chunkStart),
    });

    ctx.emit({
      type: TokenType.UnterminatedJsString,
      start,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(start),
    });
  };

  export const templateExpression = (ctx: TokenizerContext) => {
    const beforeDollar = ctx.cursor.position;
    ctx.cursor.advance();
    ctx.emit({
      type: TokenType.Dollar,
      start: beforeDollar,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(beforeDollar),
    });

    const beforeBrace = ctx.cursor.position;
    ctx.cursor.advance();
    ctx.emit({
      type: TokenType.OpenBrace,
      start: beforeBrace,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(beforeBrace),
    });

    consume.Js(ctx);
  };

  export const string = (ctx: TokenizerContext) => {
    const start = ctx.cursor.position;
    const quote = ctx.cursor.peek();
    ctx.cursor.advance();

    ctx.emit({
      type: TokenType.Quote,
      start,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(start),
    });

    let chunkStart = ctx.cursor.position;
    while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      // Skip escaped characters
      if (code === char.backslash) {
        ctx.cursor.advance();

        if (!ctx.cursor.eof) {
          ctx.cursor.advance();
        }

        continue;
      }

      // String closed successfully.
      if (code === quote) {
        ctx.emitIf(chunkStart < ctx.cursor.position, {
          type: TokenType.JsString,
          start: chunkStart,
          end: ctx.cursor.position,
          value: ctx.cursor.getChars(chunkStart),
        });

        const endStart = ctx.cursor.position;
        ctx.cursor.advance();

        ctx.emit({
          type: TokenType.Quote,
          start: endStart,
          end: ctx.cursor.position,
          value: ctx.cursor.getChars(endStart),
        });

        return;
      }

      // Single and double quoted JS strings cannot contain newlines
      if (code === char.carriageReturn || code === char.lineFeed) {
        ctx.emitIf(chunkStart < ctx.cursor.position, {
          type: TokenType.JsString,
          start: chunkStart,
          end: ctx.cursor.position,
          value: ctx.cursor.getChars(chunkStart),
        });
        ctx.emit({
          type: TokenType.UnterminatedJsString,
          start,
          end: ctx.cursor.position,
          value: ctx.cursor.getChars(start),
        });

        return;
      }

      ctx.cursor.advance();
    }

    ctx.emitIf(chunkStart < ctx.cursor.position, {
      type: TokenType.JsString,
      start: chunkStart,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(chunkStart),
    });
    // ran Out Of Input Before The string closed
    ctx.emit({
      type: TokenType.UnterminatedJsString,
      start,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(start),
    });
  };

  export const lineComment = (ctx: TokenizerContext) => {
    const start = ctx.cursor.position;
    ctx.cursor.advanceBy(2);

    ctx.emit({
      type: TokenType.DoubleSlash,
      start,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(start),
    });

    const contentStart = ctx.cursor.position;

    while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      if (code === char.carriageReturn || code === char.lineFeed) {
        ctx.emitIf(contentStart < ctx.cursor.position, {
          type: TokenType.CommentText,
          start: contentStart,
          end: ctx.cursor.position,
          value: ctx.cursor.getChars(contentStart),
        });

        return;
      }
      ctx.cursor.advance();
    }
  };

  export const blockComment = (ctx: TokenizerContext) => {
    const start = ctx.cursor.position;
    ctx.cursor.advanceBy(2);

    ctx.emit({
      type: TokenType.SlashAsterisk,
      start,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(start),
    });

    const contentStart = ctx.cursor.position;
    while (!ctx.cursor.eof) {
      if (ctx.cursor.peek() === char.asterisk && ctx.cursor.peekAtOffset(1) === char.slash) {
        ctx.emitIf(contentStart < ctx.cursor.position, {
          type: TokenType.CommentText,
          start: contentStart,
          end: ctx.cursor.position,
          value: ctx.cursor.getChars(contentStart),
        });

        const endStart = ctx.cursor.position;
        ctx.cursor.advanceBy(2);

        ctx.emit({
          type: TokenType.AsteriskSlash,
          start: endStart,
          end: ctx.cursor.position,
          value: ctx.cursor.getChars(endStart),
        });

        return;
      }
      ctx.cursor.advance();
    }

    ctx.emitIf(contentStart < ctx.cursor.position, {
      type: TokenType.CommentText,
      start: contentStart,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(contentStart),
    });
    ctx.emit({
      type: TokenType.UnterminatedBlockComment,
      start,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(start),
    });
  };

  export const Js = (ctx: TokenizerContext) => {
    let depth = 1;
    let chunkStart = ctx.cursor.position;

    while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      // Handle Js Strings
      if (is.quote(code)) {
        ctx.emitIf(chunkStart < ctx.cursor.position, {
          type: TokenType.JsExpression,
          start: chunkStart,
          end: ctx.cursor.position,
          value: ctx.cursor.getChars(chunkStart),
        });

        consume.string(ctx);
        chunkStart = ctx.cursor.position;
        continue;
      }

      // Handle Template Literals
      if (code === char.backtick) {
        ctx.emitIf(chunkStart < ctx.cursor.position, {
          type: TokenType.JsExpression,
          start: chunkStart,
          end: ctx.cursor.position,
          value: ctx.cursor.getChars(chunkStart),
        });

        consume.templateLiteral(ctx);
        chunkStart = ctx.cursor.position;
        continue;
      }

      if (is.lineCommentStart(ctx.cursor)) {
        ctx.emitIf(chunkStart < ctx.cursor.position, {
          type: TokenType.JsExpression,
          start: chunkStart,
          end: ctx.cursor.position,
          value: ctx.cursor.getChars(chunkStart),
        });

        consume.lineComment(ctx);
        chunkStart = ctx.cursor.position;
        continue;
      }

      if (is.blockCommentStart(ctx.cursor)) {
        ctx.emitIf(chunkStart < ctx.cursor.position, {
          type: TokenType.JsExpression,
          start: chunkStart,
          end: ctx.cursor.position,
          value: ctx.cursor.getChars(chunkStart),
        });

        consume.blockComment(ctx);
        chunkStart = ctx.cursor.position;
        continue;
      }

      // Sliz template interpolation will not support jsx-like nested html inside js
      if (is.tagLike(ctx.cursor)) {
        ctx.emitIf(chunkStart < ctx.cursor.position, {
          type: TokenType.JsExpression,
          start: chunkStart,
          end: ctx.cursor.position,
          value: ctx.cursor.getChars(chunkStart),
        });

        ctx.emit({
          type: TokenType.UnterminatedJsExpression,
          start: ctx.cursor.position,
          end: ctx.cursor.position,
          value: undefined,
        });

        return;
      }

      if (code === char.openBrace) {
        depth++;
        ctx.cursor.advance();
        continue;
      }

      if (code === char.closeBrace) {
        depth--;

        if (depth === 0) {
          ctx.emitIf(chunkStart < ctx.cursor.position, {
            type: TokenType.JsExpression,
            start: chunkStart,
            end: ctx.cursor.position,
            value: ctx.cursor.getChars(chunkStart),
          });

          const closeStart = ctx.cursor.position;

          ctx.cursor.advance();

          ctx.emit({
            type: TokenType.CloseBrace,
            start: closeStart,
            end: ctx.cursor.position,
            value: ctx.cursor.getChars(closeStart),
          });

          return;
        }

        ctx.cursor.advance();
        continue;
      }

      ctx.cursor.advance();
    }

    // ran out of input before depth returned to 0
    ctx.emitIf(chunkStart < ctx.cursor.position, {
      type: TokenType.JsExpression,
      start: chunkStart,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(chunkStart),
    });

    ctx.emit({
      type: TokenType.UnterminatedJsExpression,
      start: ctx.cursor.position,
      end: ctx.cursor.position,
      value: undefined,
    });
  };

  export const htmlComment = (ctx: TokenizerContext) => {
    const commentStart = ctx.cursor.position;

    // Consume <!--
    ctx.cursor.advanceBy(4);
    ctx.emit({
      type: TokenType.HtmlCommentStart,
      start: commentStart,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(commentStart),
    });

    const contentStart = ctx.cursor.position;

    while (!ctx.cursor.eof) {
      // As Per Html Spec Nested Comments Are Not Allowed Parser Will Give necessary error
      if (is.htmlCommentOpen(ctx.cursor)) {
        const nestedStart = ctx.cursor.position;
        ctx.cursor.advanceBy(4);

        ctx.emit({
          type: TokenType.HtmlCommentStart,
          start: nestedStart,
          end: ctx.cursor.position,
          value: ctx.cursor.getChars(nestedStart),
        });
        continue;
      }

      if (is.htmlCommentClose(ctx.cursor)) {
        const commentEnd = ctx.cursor.position;

        if (commentEnd > contentStart) {
          ctx.emit({
            type: TokenType.HtmlCommentContent,
            start: contentStart,
            end: commentEnd,
            value: ctx.cursor.getChars(contentStart),
          });
        }

        ctx.cursor.advanceBy(3);
        ctx.emit({
          type: TokenType.HtmlCommentEnd,
          start: commentEnd,
          end: ctx.cursor.position,
          value: ctx.cursor.getChars(commentEnd),
        });

        return;
      }

      ctx.cursor.advance();
    }

    ctx.emitIf(ctx.cursor.position > contentStart, {
      type: TokenType.HtmlCommentContent,
      start: contentStart,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(contentStart),
    });

    ctx.emit({
      type: TokenType.UnterminatedHtmlComment,
      start: commentStart,
      end: ctx.cursor.position,
      value: undefined,
    });
  };

  /*===== JS Consumer =====*/
  export const expression = (ctx: TokenizerContext) => {
    const start = ctx.cursor.position;
    ctx.cursor.advance();

    ctx.emit({
      type: TokenType.OpenBrace,
      start,
      end: start + 1,
      value: ctx.cursor.getChars(start),
    });
    consume.Js(ctx);
  };

  /*====== TEXT Consumer =====*/
  export const text = (ctx: TokenizerContext) => {
    const start = ctx.cursor.position;

    while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      if (is.tagLike(ctx.cursor) || code === char.openBrace) {
        break;
      }

      ctx.cursor.advance();
    }

    ctx.emitIf(ctx.cursor.position !== start, {
      type: TokenType.Text,
      start: start,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(start),
    });
  };

  /*=========== Markup Consumer ===========*/

  export const whiteSpace = (ctx: TokenizerContext) => {
    const start = ctx.cursor.position;
    while (is.whitespace(ctx.cursor.peek())) {
      ctx.cursor.advance();
    }
    ctx.emitIf(ctx.cursor.position > start, {
      type: TokenType.Whitespace,
      start,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(start),
    });
  };

  export const quotedAttributeValue = (ctx: TokenizerContext) => {
    const start = ctx.cursor.position;
    const quote = ctx.cursor.peek();

    ctx.cursor.advance();

    while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      if (code === quote) {
        ctx.cursor.advance();

        ctx.emit({
          type: TokenType.AttributeValue,
          start,
          end: ctx.cursor.position,
          value: ctx.cursor.getChars(start),
        });

        return;
      }

      ctx.cursor.advance();
    }

    ctx.emit({
      type: TokenType.AttributeValue,
      start,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(start),
    });

    ctx.emit({
      type: TokenType.UnterminatedString,
      start,
      end: ctx.cursor.position,
      value: undefined,
    });
  };

  export const unquotedAttributeValue = (ctx: TokenizerContext) => {
    const start = ctx.cursor.position;

    while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      if (is.whitespace(code) || is.tagEnd(ctx.cursor) || code === char.openBrace) {
        break;
      }

      ctx.cursor.advance();
    }

    if (ctx.cursor.position === start) {
      return;
    }

    ctx.emit({
      type: TokenType.AttributeValue,
      start,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(start),
    });
  };

  export const attributeValue = (ctx: TokenizerContext) => {
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
  };

  export const attribute = (ctx: TokenizerContext) => {
    const start = ctx.cursor.position;

    while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      if (!is.attributeNameChar(code) || code === char.equals || is.tagEnd(ctx.cursor)) {
        break;
      }

      ctx.cursor.advance();
    }

    if (ctx.cursor.position === start) {
      return;
    }

    ctx.emit({
      type: TokenType.AttributeName,
      start,
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
      type: TokenType.Equals,
      start: equalsStart,
      end: ctx.cursor.position,
      value: "=",
    });

    consume.whiteSpace(ctx);
    consume.attributeValue(ctx);
  };

  export const attributes = (ctx: TokenizerContext) => {
    while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      if (is.tagEnd(ctx.cursor)) {
        return;
      }

      if (code === char.openBrace || code === char.closeBrace || code === char.slash) {
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
          type: TokenType.UnexpectedCharacter,
          start: ctx.cursor.position,
          end: ctx.cursor.position + 1,
          value: String.fromCharCode(code),
        });
        ctx.cursor.advance();
      }
    }
  };

  export const tagEnd = (ctx: TokenizerContext) => {
    while (!ctx.cursor.eof) {
      const start = ctx.cursor.position;

      if (ctx.cursor.peek() === char.slash && ctx.cursor.peekAtOffset(1) === char.greaterThan) {
        ctx.cursor.advance();
        ctx.cursor.advance();

        ctx.emit({
          type: TokenType.SlashGreaterThan,
          start,
          end: ctx.cursor.position,
          value: "/>",
        });

        return;
      }

      if (ctx.cursor.peek() === char.greaterThan) {
        ctx.cursor.advance();

        ctx.emit({
          type: TokenType.GreaterThan,
          start,
          end: ctx.cursor.position,
          value: ">",
        });

        return;
      }

      ctx.emit({
        type: TokenType.UnexpectedCharacter,
        start: ctx.cursor.position,
        end: ctx.cursor.position + 1,
        value: String.fromCharCode(ctx.cursor.peek()),
      });

      ctx.cursor.advance();
    }
  };

  export const closingTag = (ctx: TokenizerContext) => {
    const start = ctx.cursor.position;
    ctx.cursor.advance();
    ctx.cursor.advance();

    ctx.emit({
      type: TokenType.LessThan,
      start,
      end: start + 1,
      value: "<",
    });

    ctx.emit({
      type: TokenType.Slash,
      start: start + 1,
      end: start + 2,
      value: "/",
    });

    const tagStart = ctx.cursor.position;

    while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      if (
        is.whitespace(code) ||
        is.tagEnd(ctx.cursor) ||
        code === char.lessThan ||
        code === char.openBrace ||
        code === char.slash
      ) {
        break;
      }

      ctx.cursor.advance();
    }

    if (ctx.cursor.position === tagStart) {
      ctx.emit({
        type: TokenType.ExpectedTagName,
        start: ctx.cursor.position,
        end: ctx.cursor.position,
        value: undefined,
      });

      consume.tagEnd(ctx);
      return;
    }

    ctx.emit({
      type: TokenType.TagName,
      start: tagStart,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(tagStart),
    });

    consume.whiteSpace(ctx);
    consume.tagEnd(ctx);
  };

  export const openingTag = (ctx: TokenizerContext) => {
    const start = ctx.cursor.position;
    ctx.cursor.advance();

    ctx.emit({
      type: TokenType.LessThan,
      start,
      end: start + 1,
      value: "<",
    });

    const tagStart = ctx.cursor.position;

    while (!ctx.cursor.eof) {
      const code = ctx.cursor.peek();

      if (
        is.whitespace(code) ||
        is.tagEnd(ctx.cursor) ||
        code === char.lessThan ||
        code === char.openBrace ||
        code === char.slash
      ) {
        break;
      }

      ctx.cursor.advance();
    }

    if (ctx.cursor.position === tagStart) {
      ctx.emit({
        type: TokenType.ExpectedTagName,
        start: ctx.cursor.position,
        end: ctx.cursor.position,
        value: undefined,
      });

      consume.tagEnd(ctx);
      return;
    }

    const tagName = ctx.cursor.getChars(tagStart).toLowerCase();

    ctx.emit({
      type: TokenType.TagName,
      start: tagStart,
      end: ctx.cursor.position,
      value: ctx.cursor.getChars(tagStart),
    });

    consume.attributes(ctx);
    consume.tagEnd(ctx);

    return tagName;
  };

  export const markup = (ctx: TokenizerContext) => {
    if (is.htmlCommentOpen(ctx.cursor)) {
      consume.htmlComment(ctx);
      return;
    }

    if (is.closingTagStart(ctx.cursor)) {
      consume.closingTag(ctx);
      return;
    }

    consume.openingTag(ctx);
  };
}
