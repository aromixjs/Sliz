import * as ts from "typescript";

const source = `
    const data = 10;

    const userData = sliz!{
        <userdata></userdata>
    }

    const other = 20;
`;

const scanner = ts.createScanner(
  ts.ScriptTarget.Latest,
  /*skipTrivia*/ true,
  ts.LanguageVariant.Standard,
);

scanner.setText(source);

while (true) {
  let kind = scanner.scan();

  if (kind === ts.SyntaxKind.Identifier && scanner.getTokenText() === "sliz") {
    const start = scanner.getTokenStart();
    const bang = scanner.scan();
    if (bang !== ts.SyntaxKind.ExclamationToken) {
      continue;
    }

    const openBrace = scanner.scan();
    if (openBrace !== ts.SyntaxKind.OpenBraceToken) {
      continue;
    }

    const bodyStart = scanner.getTokenEnd();

    let depth = 1;

    while (depth > 0) {
      const innerKind = scanner.scan();

      if (innerKind === ts.SyntaxKind.EndOfFileToken) {
        throw new Error("Unterminated sliz macro");
      }

      if (innerKind === ts.SyntaxKind.OpenBraceToken) {
        depth++;
      } else if (innerKind === ts.SyntaxKind.CloseBraceToken) {
        depth--;
      }
    }
    const end = scanner.getTokenEnd();
    const macro = {
      kind: "SlizMacro",
      start,
      end,
      text: source.slice(start, end),
      body: source.slice(bodyStart, end - 1),
    };

    console.log(macro);

    continue;
  }

  if (kind === ts.SyntaxKind.EndOfFileToken) {
    break;
  }
}
