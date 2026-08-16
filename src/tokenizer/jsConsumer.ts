import chars from "../scanner/chars";
import is from "../scanner/is";
import { CharacterCursor } from "./cursor";

// Resolves a `{ ... }` JS expression region without emitting any tokens.
// Precondition: cursor.peek() is the opening brace of the expression.
//
// This does not recurse. A `${` inside a template literal wants to reopen
// js-expression scanning, and a plain recursive call would need that
// function defined below this one, which would only work by relying on
// hoisting. An explicit frame stack sidesteps that entirely and also
// avoids introducing a class for what is really one operation.

type JsFrame = {
  kind: "js";
  depth: number;
  start: number;
};

type StringFrame = {
  kind: "string";
  quote: number;
  start: number;
};

type TemplateFrame = {
  kind: "template";
  start: number;
};

type LineCommentFrame = {
  kind: "lineComment";
  start: number;
};

type BlockCommentFrame = {
  kind: "blockComment";
  start: number;
};

type ResolverFrame = JsFrame | StringFrame | TemplateFrame | LineCommentFrame | BlockCommentFrame;

export type JsExpressionIssueKind =
  | "unterminatedString"
  | "unterminatedTemplate"
  | "unterminatedBlockComment"
  | "unterminatedExpression"
  | "tagLike";

export type JsExpressionIssue = {
  kind: JsExpressionIssueKind;
  start: number;
  end: number;
  // true when the scan gave up on this specific piece and kept going.
  // false when this piece is (part of) why the whole resolution failed.
  recovered: boolean;
};

export type JsExpressionResolution =
  | { status: "closed"; end: number; issues: Array<JsExpressionIssue> }
  | { status: "unterminated"; end: number; issues: Array<JsExpressionIssue> };

// Reports every frame still open at the point scanning stopped, innermost
// first. A dangling line comment is never reported: `//...` is valid
// whether it ends at a newline or at the end of input, so it is skipped
// and whatever it was nested inside is still evaluated normally.
const collectUnresolvedIssues = (
  stack: Array<ResolverFrame>,
  at: number,
): Array<JsExpressionIssue> => {
  const collected: Array<JsExpressionIssue> = [];
  let index = stack.length - 1;

  while (index >= 0) {
    const frame = stack[index];

    if (frame.kind === "js") {
      collected.push({
        kind: "unterminatedExpression",
        start: frame.start,
        end: at,
        recovered: false,
      });
    }

    if (frame.kind === "string") {
      collected.push({ kind: "unterminatedString", start: frame.start, end: at, recovered: false });
    }

    if (frame.kind === "template") {
      collected.push({
        kind: "unterminatedTemplate",
        start: frame.start,
        end: at,
        recovered: false,
      });
    }

    if (frame.kind === "blockComment") {
      collected.push({
        kind: "unterminatedBlockComment",
        start: frame.start,
        end: at,
        recovered: false,
      });
    }

    index--;
  }

  return collected;
};

export const resolveJsExpression = (cursor: CharacterCursor): JsExpressionResolution => {
  const start = cursor.position;
  // Consume the opening brace itself.
  cursor.advance();

  const stack: Array<ResolverFrame> = [{ kind: "js", depth: 1, start }];
  const issues: Array<JsExpressionIssue> = [];

  while (!cursor.eof) {
    const frame = stack[stack.length - 1];
    const code = cursor.peek();

    if (frame.kind === "js") {
      if (is.quote(code)) {
        stack.push({ kind: "string", quote: code, start: cursor.position });
        cursor.advance();
        continue;
      }

      if (code === chars.backtick) {
        stack.push({ kind: "template", start: cursor.position });
        cursor.advance();
        continue;
      }

      if (is.lineCommentStart(cursor)) {
        stack.push({ kind: "lineComment", start: cursor.position });
        cursor.advanceBy(2);
        continue;
      }

      if (is.blockCommentStart(cursor)) {
        stack.push({ kind: "blockComment", start: cursor.position });
        cursor.advanceBy(2);
        continue;
      }

      // Sliz template interpolation will not support jsx-like nested html
      // inside js. Bail without consuming, so whatever comes next can
      // reparse this position as markup.
      if (is.tagLike(cursor)) {
        const bailPosition = cursor.position;
        issues.push({ kind: "tagLike", start: bailPosition, end: bailPosition, recovered: false });
        issues.push(...collectUnresolvedIssues(stack, bailPosition));

        return { status: "unterminated", end: bailPosition, issues };
      }

      if (code === chars.openBrace) {
        frame.depth++;
        cursor.advance();
        continue;
      }

      if (code === chars.closeBrace) {
        frame.depth--;
        cursor.advance();

        if (frame.depth === 0) {
          stack.pop();

          if (stack.length === 0) {
            return { status: "closed", end: cursor.position, issues };
          }
        }

        continue;
      }

      cursor.advance();
      continue;
    }

    if (frame.kind === "string") {
      if (code === chars.backslash) {
        cursor.advance();

        if (!cursor.eof) {
          cursor.advance();
        }

        continue;
      }

      if (code === frame.quote) {
        cursor.advance();
        stack.pop();
        continue;
      }

      if (code === chars.carriageReturn || code === chars.lineFeed) {
        // Single and double quoted strings cannot contain newlines.
        // Log it and abandon the string without consuming the newline,
        // so the enclosing js frame can pick back up from here.
        issues.push({
          kind: "unterminatedString",
          start: frame.start,
          end: cursor.position,
          recovered: true,
        });
        stack.pop();
        continue;
      }

      cursor.advance();
      continue;
    }

    if (frame.kind === "template") {
      if (code === chars.backslash) {
        cursor.advance();

        if (!cursor.eof) {
          cursor.advance();
        }

        continue;
      }

      if (code === chars.dollar && cursor.peekAtOffset(1) === chars.openBrace) {
        const interpolationStart = cursor.position;
        cursor.advance();
        cursor.advance();
        stack.push({ kind: "js", depth: 1, start: interpolationStart });
        continue;
      }

      if (code === chars.backtick) {
        cursor.advance();
        stack.pop();
        continue;
      }

      cursor.advance();
      continue;
    }

    if (frame.kind === "lineComment") {
      if (code === chars.carriageReturn || code === chars.lineFeed) {
        stack.pop();
        continue;
      }

      cursor.advance();
      continue;
    }

    // frame.kind === 'blockComment'
    if (code === chars.asterisk && cursor.peekAtOffset(1) === chars.slash) {
      cursor.advanceBy(2);
      stack.pop();
      continue;
    }

    cursor.advance();
  }

  issues.push(...collectUnresolvedIssues(stack, cursor.position));

  return { status: "unterminated", end: cursor.position, issues };
};
