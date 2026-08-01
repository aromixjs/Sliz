export enum TokenKind {
  TS_CHUNK,
  TEMPLATE_START, // ~T"
  TEMPLATE_END, // "T~
  DOT,

  EOF,
}


export interface Token<Kind extends TokenKind = TokenKind> {
  kind: Kind;
  value: string | null;
}
