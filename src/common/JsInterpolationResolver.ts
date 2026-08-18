import * as ts from "typescript";

enum FrameKind {
  Brace,
  TemplateInterpolation,
}

const RegexExpectedAfter = new Set<ts.SyntaxKind>([
  ts.SyntaxKind.ReturnKeyword,
  ts.SyntaxKind.TypeOfKeyword,
  ts.SyntaxKind.InstanceOfKeyword,
  ts.SyntaxKind.InKeyword,
  ts.SyntaxKind.OfKeyword,
  ts.SyntaxKind.NewKeyword,
  ts.SyntaxKind.DeleteKeyword,
  ts.SyntaxKind.VoidKeyword,
  ts.SyntaxKind.YieldKeyword,
  ts.SyntaxKind.ThrowKeyword,
  ts.SyntaxKind.CaseKeyword,
  ts.SyntaxKind.EqualsToken,
  ts.SyntaxKind.OpenParenToken,
  ts.SyntaxKind.OpenBraceToken,
  ts.SyntaxKind.OpenBracketToken,
  ts.SyntaxKind.CommaToken,
  ts.SyntaxKind.SemicolonToken,
  ts.SyntaxKind.ExclamationToken,
  ts.SyntaxKind.AmpersandAmpersandToken,
  ts.SyntaxKind.BarBarToken,
  ts.SyntaxKind.QuestionToken,
  ts.SyntaxKind.ColonToken,
  ts.SyntaxKind.PlusToken,
  ts.SyntaxKind.MinusToken,
]);

const TriviaKinds = new Set<ts.SyntaxKind>([
  ts.SyntaxKind.SingleLineCommentTrivia,
  ts.SyntaxKind.MultiLineCommentTrivia,
  ts.SyntaxKind.NewLineTrivia,
  ts.SyntaxKind.WhitespaceTrivia,
  ts.SyntaxKind.ShebangTrivia,
  ts.SyntaxKind.ConflictMarkerTrivia,
]);

export enum JsInterpolationStatus {
  Closed = "Closed",
  UnterminatedLiteral = "UnterminatedLiteral",
  UnterminatedEof = "UnterminatedEof",
}

export interface JsInterpolationOutcome {
  status: JsInterpolationStatus;
  start: number;
  end: number;
  text: string;
}

// See docs/JsInterpolationResolver.md for the full algorithm and outcome reference.
export class JsInterpolationResolver {
  private readonly source: string;
  private readonly scanner: ts.Scanner;

  constructor(source: string) {
    this.source = source;
    this.scanner = ts.createScanner(ts.ScriptTarget.Latest, /*skipTrivia*/ false);
  }

  resolve(openBraceIndex: number): JsInterpolationOutcome {
    if (!Number.isFinite(openBraceIndex) || openBraceIndex < 0) {
      return {
        status: JsInterpolationStatus.UnterminatedEof,
        start: openBraceIndex,
        end: openBraceIndex,
        text: "",
      };
    }

    this.scanner.setText(this.source);
    this.scanner.resetTokenState(openBraceIndex + 1);
    const stack: FrameKind[] = [FrameKind.Brace];
    let previousSignificantKind: ts.SyntaxKind = ts.SyntaxKind.OpenBraceToken;

    while (true) {
      let kind = this.scanner.scan();

      if (TriviaKinds.has(kind)) {
        continue;
      }

      if (kind === ts.SyntaxKind.SlashToken || kind === ts.SyntaxKind.SlashEqualsToken) {
        if (RegexExpectedAfter.has(previousSignificantKind)) {
          kind = this.scanner.reScanSlashToken();
        }
      }

      if (
        kind === ts.SyntaxKind.CloseBraceToken &&
        stack[stack.length - 1] === FrameKind.TemplateInterpolation
      ) {
        kind = this.scanner.reScanTemplateToken(/* isTaggedTemplate */ false);
      }

      if (this.scanner.isUnterminated()) {
        const end = this.scanner.getTokenEnd();
        return {
          status: JsInterpolationStatus.UnterminatedLiteral,
          start: openBraceIndex,
          end,
          text: this.source.slice(openBraceIndex, end),
        };
      }

      if (kind === ts.SyntaxKind.EndOfFileToken) {
        const end = this.scanner.getTokenEnd();
        return {
          status: JsInterpolationStatus.UnterminatedEof,
          start: openBraceIndex,
          end,
          text: this.source.slice(openBraceIndex, end),
        };
      }

      if (kind === ts.SyntaxKind.OpenBraceToken) {
        stack.push(FrameKind.Brace);
      }

      if (kind === ts.SyntaxKind.TemplateHead) {
        stack.push(FrameKind.TemplateInterpolation);
      }

      if (kind === ts.SyntaxKind.CloseBraceToken || kind === ts.SyntaxKind.TemplateTail) {
        stack.pop();
        if (stack.length === 0) {
          const end = this.scanner.getTokenEnd();
          return {
            status: JsInterpolationStatus.Closed,
            start: openBraceIndex,
            end,
            text: this.source.slice(openBraceIndex, end),
          };
        }
      }

      previousSignificantKind = kind;
    }
  }
}
