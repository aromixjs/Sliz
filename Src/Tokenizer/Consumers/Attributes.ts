import char from "../../Scanner/Char";
import is from "../../Scanner/Is";
import skip from "../../Scanner/Skip";
import { SyntaxKind, TokenizerContext } from "../Token";
import { consumeExpression } from "./Expression";

export function consumeAttributes(ctx: TokenizerContext) {
  while (!ctx.cursor.eof) {
    const code = ctx.cursor.peek();

    if (
      code === char.greaterThan ||
      (code === char.slash && ctx.cursor.peek(1) === char.greaterThan)
    ) {
      return;
    }

    consumeAttribute(ctx);
  }
}

export function consumeAttribute(ctx: TokenizerContext) {
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

  if (ctx.cursor.peek() !== char.equals) {
    return;
  }

  ctx.cursor.advance();

  consumeAttributeValue(ctx);
}

export function consumeAttributeValue(ctx: TokenizerContext) {
  const code = ctx.cursor.peek();

  if (code === char.openBrace) {
    consumeExpression(ctx);
    return;
  }

  if (
    code === char.singleQuote ||
    code === char.doubleQuote
  ) {
    consumeQuotedAttributeValue(ctx);
    return;
  }

  consumeUnquotedAttributeValue(ctx);
}

function consumeQuotedAttributeValue(ctx: TokenizerContext) {
  // TODO: implement
}

function consumeUnquotedAttributeValue(ctx: TokenizerContext) {
  // TODO: implement
}
