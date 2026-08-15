import char from "../../scanner/char";
import { blockCommentStart, isQuote, isTagLike, lineCommentStart } from "../../scanner/is";
import { TokenizerContext, TokenType } from "../token";


const consumeTemplateLiteral = (ctx: TokenizerContext) => {
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

      consumeTemplateExpression(ctx);
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
}

const consumeTemplateExpression = (ctx: TokenizerContext) => {
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

  consumeJs(ctx);
}

const consumeString = (ctx: TokenizerContext) => {
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
}

const consumeLineComment = (ctx: TokenizerContext) => {
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
    ctx.cursor.advance()
  }
}

const consumeBlockComment = (ctx: TokenizerContext) => {
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

      return
    }
    ctx.cursor.advance()
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
}


const consumeJs = (ctx: TokenizerContext) => {
  let depth = 1;
  let chunkStart = ctx.cursor.position;

  while (!ctx.cursor.eof) {
    const code = ctx.cursor.peek();

    // Handle Js Strings
    if (isQuote(code)) {
      ctx.emitIf(chunkStart < ctx.cursor.position, {
        type: TokenType.JsExpression,
        start: chunkStart,
        end: ctx.cursor.position,
        value: ctx.cursor.getChars(chunkStart),
      });

      consumeString(ctx);
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

      consumeTemplateLiteral(ctx);
      chunkStart = ctx.cursor.position;
      continue;
    }

    if (lineCommentStart(ctx.cursor)) {
      ctx.emitIf(chunkStart < ctx.cursor.position, {
        type: TokenType.JsExpression,
        start: chunkStart,
        end: ctx.cursor.position,
        value: ctx.cursor.getChars(chunkStart),
      });

      consumeLineComment(ctx)
      chunkStart = ctx.cursor.position;
      continue;
    }

    if (blockCommentStart(ctx.cursor)) {
      ctx.emitIf(chunkStart < ctx.cursor.position, {
        type: TokenType.JsExpression,
        start: chunkStart,
        end: ctx.cursor.position,
        value: ctx.cursor.getChars(chunkStart),
      });

      consumeBlockComment(ctx)
      chunkStart = ctx.cursor.position;
      continue;
    }

    // Sliz template interpolation will not support jsx-like nested html inside js
    if (isTagLike(ctx.cursor)) {
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
}

/**
 * Consumes a JavaScript interpolation expression enclosed in curly braces.
 */
export const consumeExpression = (ctx: TokenizerContext) => {
  const start = ctx.cursor.position;
  ctx.cursor.advance();

  ctx.emit({
    type: TokenType.OpenBrace,
    start,
    end: start + 1,
    value: ctx.cursor.getChars(start),
  });
  consumeJs(ctx);
}
