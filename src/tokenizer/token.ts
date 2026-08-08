import { Maybe } from "../types/maybe";

export enum SyntaxKind {
  Unknown = "Unknown",
  EndOfFile = "EndOfFile",
  LessThan = "LessThan",
  GreaterThan = "GreaterThan",
  LessThanSlash = "LessThanSlash", // '</'
  TagName = "TagName",
  WhiteSpace = "WhiteSpace",
  AttributeName = "AttributeName",
  Equals = "Equals",
  AttributeValue = "AttributeValue",
  Expression = "Expression",
  SelfCloseEnd = "SelfCloseEnd",
  Comment = "Comment",
  Doctype = "Doctype",
  RawText = "RawText", // covers script/style bodies AND <server> bodies alike
  Text = "Text",
}

export enum TokenizerMode {
  Root,
  TagOpen,
  InsideTag,
  RawText,
  Comment,
  Doctype,
}

export interface Token {
  kind: SyntaxKind;
  start: number;
  end: number;
  value?: string;
}

// Matcher Types
export interface TokenizerContext {
  readonly source: string;
  readonly cursor: number;
  readonly mode: TokenizerMode;
  /**
   * Set once TagName is matched. While in RawText mode, this is the tag
   * name being scanned for as a closing tag (e.g. "script", "server").
   */
  readonly tagName?: string;
}
export interface MatchResult {
  token: Token;
  nextCursor: number;
  nextMode: TokenizerMode;
  nextTagName?: string;
}

export type Matcher = (ctx: TokenizerContext) => Maybe<MatchResult>;

/**
 * Tag names that switch the tokenizer into RawText mode on TagEnd instead
 * of Root — content is captured verbatim up to the matching close tag,
 * with no tag/expression recognition inside. Add new raw-text tags here,
 * not as tokenizer special-cases.
 */
export const RawTextTags = new Set(["script", "style", "server"]);
