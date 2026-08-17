import { CharacterCursor } from "../../common/cursor";
import {
   FrameKind,
   JsExpressionIssue,
   JsExpressionIssueKind,
   JsExpressionResolution,
   ResolverFrame,
} from "./token";
export class JsResolver {
  private cursor: CharacterCursor;
  private stack: Array<ResolverFrame> = [];
  private issues: Array<JsExpressionIssue> = [];

  constructor(cursor: CharacterCursor) {
    this.cursor = cursor;
  }

  resolve(): JsExpressionResolution {
    const start = this.cursor.position;
    this.cursor.advance();
    this.stack.push({ kind: FrameKind.Js, depth: 1, start });

    while (!this.cursor.eof) {
      const frame = this.stack[this.stack.length - 1];
      const code = this.cursor.peek();
      /* ==== JS Frame ===== */
      if (frame.kind === FrameKind.Js) {
        if (is.quote(code)) {
          this.stack.push({ kind: FrameKind.String, quote: code, start: this.cursor.position });
          this.cursor.advance();
          continue;
        }
        if (code === chars.backtick) {
          this.stack.push({ kind: FrameKind.Template, start: this.cursor.position });
          this.cursor.advance();
          continue;
        }

        if (is.lineCommentStart(this.cursor)) {
          this.stack.push({ kind: FrameKind.LineComment, start: this.cursor.position });
          this.cursor.advanceBy(2);
          continue;
        }

        if (is.blockCommentStart(this.cursor)) {
          this.stack.push({ kind: FrameKind.BlockComment, start: this.cursor.position });
          this.cursor.advanceBy(2);
          continue;
        }

        if (is.tagLike(this.cursor)) {
          const bailPosition = this.cursor.position;
          this.issues.push({
            kind: JsExpressionIssueKind.TagLike,
            start: bailPosition,
            end: bailPosition,
          });
          this.addUnresolvedIssues(bailPosition);
          return { status: "unterminated", end: bailPosition, issues: this.issues };
        }

        if (code === chars.openBrace) {
          frame.depth++;
          this.cursor.advance();
          continue;
        }

        if (code === chars.closeBrace) {
          frame.depth--;
          this.cursor.advance();

          if (frame.depth === 0) {
            this.stack.pop();

            if (this.stack.length === 0) {
              return { status: "closed", end: this.cursor.position, issues: this.issues };
            }
          }

          continue;
        }

        this.cursor.advance();
        continue;
      }

      /* ==== String Frame ===== */
      if (frame.kind === FrameKind.String) {
        if (code === chars.backslash) {
          this.cursor.advance();
          this.cursor.advanceIf(!this.cursor.eof);
          continue;
        }

        if (code === frame.quote) {
          this.cursor.advance();
          this.stack.pop();
          continue;
        }

        if (code === chars.carriageReturn || code === chars.lineFeed) {
          this.issues.push({
            kind: JsExpressionIssueKind.UnterminatedString,
            start: frame.start,
            end: this.cursor.position,
          });
          this.stack.pop();
          continue;
        }

        this.cursor.advance();
        continue;
      }
      /* ==== Template Frame ===== */
      if (frame.kind === FrameKind.Template) {
        if (code === chars.backslash) {
          this.cursor.advance();
          this.cursor.advanceIf(!this.cursor.eof);
          continue;
        }

        if (code === chars.dollar && this.cursor.peekAtOffset(1) === chars.openBrace) {
          const interpolationStart = this.cursor.position;
          this.cursor.advance();
          this.cursor.advance();
          this.stack.push({ kind: FrameKind.Js, depth: 1, start: interpolationStart });
          continue;
        }

        if (code === chars.backtick) {
          this.cursor.advance();
          this.stack.pop();
          continue;
        }

        this.cursor.advance();
        continue;
      }
      /* ==== LineComment Frame ===== */
      if (frame.kind === FrameKind.LineComment) {
        if (code === chars.carriageReturn || code === chars.lineFeed) {
          this.stack.pop();
          continue;
        }

        this.cursor.advance();
        continue;
      }
      /* ==== BlockComment Frame ===== */
      if (code === chars.asterisk && this.cursor.peekAtOffset(1) === chars.slash) {
        this.cursor.advanceBy(2);
        this.stack.pop();
        continue;
      }

      this.cursor.advance();
    }
    this.addUnresolvedIssues(this.cursor.position);
    return { status: "unterminated", end: this.cursor.position, issues: this.issues };
  }

  private addUnresolvedIssues(at: number) {
    let index = this.stack.length - 1;
    while (index >= 0) {
      const frame = this.stack[index];
      switch (frame.kind) {
        case FrameKind.Js:
          this.issues.push({
            kind: JsExpressionIssueKind.UnterminatedExpression,
            start: frame.start,
            end: at,
          });
          break;

        case FrameKind.String:
          this.issues.push({
            kind: JsExpressionIssueKind.UnterminatedString,
            start: frame.start,
            end: at,
          });
          break;

        case FrameKind.Template:
          this.issues.push({
            kind: JsExpressionIssueKind.UnterminatedTemplate,
            start: frame.start,
            end: at,
          });
          break;

        case FrameKind.BlockComment:
          this.issues.push({
            kind: JsExpressionIssueKind.UnterminatedBlockComment,
            start: frame.start,
            end: at,
          });
          break;
        default:
          break;
      }
      index--;
    }
  }
}
