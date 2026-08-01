export enum TokenKind {
  TS_CHUNK,
  TEMPLATE_START, // ~T"
  TEMPLATE_END, // "T~

  WHITESPACE,
  NEWLINE,

  TAG_OPEN, // <
  TAG_CLOSE_OPEN, // </
  TAG_END, // >
  TAG_SELF_CLOSE, // />
  IDENTIFIER, // tag names, attribute names, directive names
  DOT, // .

  EQUALS, // =
  STRING, // "..." or '...'
  TEXT, // raw text between tags

  BRACE_EXPR, // { ... }  (interpolation / x={fn} value)
  PAREN_EXPR, // ( ... )  (.if(...) / .for(...) condition)

  EOF,
}

export interface SourcePosition {
  offset: number;
  line: number;
  column: number;
}

export interface SourceRange {
  start: SourcePosition;
  end: SourcePosition;
}

export interface Token<Kind extends TokenKind = TokenKind> {
  kind: Kind;
  value: string | null;
  range: SourceRange;
}
