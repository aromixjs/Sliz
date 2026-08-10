import { DiagnosticCode, DiagnosticSeverity } from "../../pipeline/context";
import char from "../../scanner/char";
import { is } from "../../scanner/is";
import { skip } from "../../scanner/skip";

import { SyntaxKind, TokenizerContext } from "../token";
import { consumeExpression } from "./expression";

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


  skip.whiteSpace(ctx.cursor)

  if (ctx.cursor.peek() !== char.equals) {
    return;
  }

  ctx.cursor.advance();
  skip.whiteSpace(ctx.cursor)
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

function consumeUnquotedAttributeValue(ctx: TokenizerContext) {
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
