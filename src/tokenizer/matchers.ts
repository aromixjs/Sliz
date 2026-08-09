import char from "../scanner/char";
import is from "../scanner/is";
import skip from "../scanner/skip";
import { Matcher, State, SyntaxKind } from "./token";

export const lessThan: Matcher = (c) => {
  const { source, cursor, state } = c;

  if (state !== State.Text) {
    return;
  }

  const current = source.charCodeAt(cursor);
  const next = source.charCodeAt(cursor + 1);

  if (current !== char.lessThan || !is.alpha(next)) {
    return;
  }

  return {
    token: {
      kind: SyntaxKind.LessThan,
      start: cursor,
      end: cursor + 1,
      value: "<",
    },
    nextCursor: cursor + 1,
    nextState: State.BeforeOpeningTagName,
  };
};

export const lessThanSlash: Matcher = (c) => {
  const { source, cursor, state } = c;


  if (
    state !== State.Text &&
    state !== State.ServerScript &&
    state !== State.ClientScript &&
    state !== State.Style
  ) {
    return;
  }

  const current = source.charCodeAt(cursor);
  const next = source.charCodeAt(cursor + 1);
  const afterNext = source.charCodeAt(cursor + 2);

  if (
    current !== char.lessThan ||
    next !== char.slash ||
    !is.alpha(afterNext)
  ) {
    return;
  }

  return {
    token: {
      kind: SyntaxKind.LessThanSlash,
      start: cursor,
      end: cursor + 2,
      value: "</",
    },
    nextCursor: cursor + 2,
    nextState: State.BeforeClosingTagName,
  };
};

export const tagName: Matcher = (c) => {
  const { source, cursor, state, tagStack } = c;

  const isOpening = state === State.BeforeOpeningTagName;
  const isClosing = state === State.BeforeClosingTagName;

  if (!isOpening && !isClosing) {
    return;
  }

  let end = cursor;

  while (end < source.length) {
    const code = source.charCodeAt(end);

    if (
      is.whitespace(code) || code === char.greaterThan || code === char.slash
    ) {
      break;
    }

    end++;
  }

  if (end === cursor) {
    return;
  }

  let value = source.slice(cursor, end);
  if (isOpening) {
    tagStack.push(value);
    return {
      token: {
        kind: SyntaxKind.TagName,
        start: cursor,
        end,
        value,
      },
      nextCursor: end,
      nextState: State.AfterOpeningTagName,
    };
  } else if (isClosing) {
    return {
      token: {
        kind: SyntaxKind.TagName,
        start: cursor,
        end,
        value,
      },
      nextCursor: end,
      nextState: State.AfterClosingTagName,
    };
  }
};

export const attributeName: Matcher = (c) => {
  const { source, cursor, state } = c;

  if (state !== State.AfterOpeningTagName &&
    state !== State.AfterAttributeValue) {
    return;
  }

  let start = skip.whiteSpace(source, cursor);
  if (start >= source.length) {
    return;
  }

  const first = source.charCodeAt(start);

  if (
    first === char.greaterThan ||
    first === char.slash
  ) {
    return;
  }
  let end = start;

  while (end < source.length) {
    const code = source.charCodeAt(end);

    if (!is.attributeName(code)) {
      break;
    }

    end++;
  }

  if (end === start) {
    return;
  }

  const afterName = skip.whiteSpace(source, end);
  let nextState;


  if (source.charCodeAt(afterName) === char.equals) {
    nextState = State.AfterAttributeName
  } else {
    nextState = State.AfterAttributeValue
  }



  return {
    token: {
      kind: SyntaxKind.AttributeName,
      start,
      end,
      value: source.slice(start, end),
    },
    nextCursor: end,
    nextState: nextState,
  };
};

export const attributeEquals: Matcher = (c) => {
  const { source, cursor, state } = c;

  if (state !== State.AfterAttributeName) {
    return;
  }

  const start = skip.whiteSpace(source, cursor);

  if (source.charCodeAt(start) !== char.equals) {
    return;
  }

  return {
    token: {
      kind: SyntaxKind.Equals,
      start,
      end: start + 1,
      value: "=",
    },
    nextCursor: start + 1,
    nextState: State.BeforeAttributeValue,
  };
};

export const attributeValue: Matcher = (c) => {
  const { source, cursor, state } = c;

  if (state !== State.BeforeAttributeValue) {
    return;
  }

  const start = skip.whiteSpace(source, cursor);

  if (start >= source.length) {
    return;
  }

  let end = start;
  const code = source.charCodeAt(end);

  if (code === char.singleQuote || code === char.doubleQuote) {
    end = skip.string(source, end);
  } else if (code === char.openBrace) {
    end = skip.braceExpression(source, end);
  } else {
    while (end < source.length) {
      const code = source.charCodeAt(end);

      if (
        code === char.space ||
        code === char.tab ||
        code === char.lineFeed ||
        code === char.carriageReturn ||
        code === char.greaterThan ||
        code === char.slash
      ) {
        break;
      }

      end++;
    }
  }

  if (end === start) {
    return;
  }

  return {
    token: {
      kind: SyntaxKind.AttributeValue,
      start,
      end,
      value: source.slice(start, end),
    },
    nextCursor: end,
    nextState: State.AfterAttributeValue,
  };
};

export const tagEnd: Matcher = (c) => {
  const { source, cursor, state, tagStack } = c;

  if (
    state !== State.AfterOpeningTagName &&
    state !== State.AfterClosingTagName &&
    state !== State.AfterAttributeName &&
    state !== State.AfterAttributeValue
  ) {
    return;
  }

  const start = skip.whiteSpace(source, cursor);

  if (source.charCodeAt(start) === char.slash) {
    if (source.charCodeAt(start + 1) !== char.greaterThan) {
      return;
    }
    tagStack.pop();
    return {
      token: {
        kind: SyntaxKind.SlashGreaterThan,
        start,
        end: start + 2,
        value: source.slice(start, start + 2),
      },
      nextCursor: start + 2,
      nextState: State.Text,
    };
  }

  if (source.charCodeAt(start) !== char.greaterThan) {
    return;
  }

  let nextState = State.Text;
  if (state === State.AfterClosingTagName) {
    tagStack.pop();
  } else {
    const tagName = tagStack[tagStack.length - 1]?.toLowerCase();
    if (tagName === "server") nextState = State.ServerScript;
    else if (tagName === "style") nextState = State.Style;
    else if (tagName === "script") nextState = State.ClientScript;
  }

  return {
    token: {
      kind: SyntaxKind.GreaterThan,
      start,
      end: start + 1,
      value: source.slice(start, start + 1),
    },
    nextCursor: start + 1,
    nextState,
  };
};

export const script: Matcher = (c) => {
  const { source, cursor, state } = c;
  const isServer = state === State.ServerScript;
  const isClient = state === State.ClientScript;

  if (!isServer && !isClient) {
    return;
  }

  let position = cursor;

  while (position < source.length) {
    const code = source.charCodeAt(position);

    if (
      code === char.lessThan && source.charCodeAt(position + 1) === char.slash
    ) {
      break;
    }
    const before = position;

    if (is.quote(code)) {
      if (code === char.backtick) {
        position = skip.template(source, position);
      } else {
        position = skip.string(source, position);
      }
      continue;
    } else if (code === char.slash) {
      const next = source.charCodeAt(position + 1);

      if (next === char.slash) {
        position = skip.lineComment(source, position);
        continue;
      } else if (next === char.asterisk) {
        position = skip.blockComment(source, position);
        continue;
      } else if (is.regexStart(source, position)) {
        position = skip.regex(source, position);
        continue;
      } else {
        position++;
      }
    } else {
      position++;
    }

    if (position <= before) {
      position = before + 1;
    }
  }

  if (position === cursor) return undefined;

  let kind: SyntaxKind;

  if (isServer) {
    kind = SyntaxKind.ServerScript;
  } else if (isClient) {
    kind = SyntaxKind.ClientScript;
  }

  return {
    token: {
      kind: kind!,
      start: cursor,
      end: position,
      value: source.slice(cursor, position),
    },
    nextCursor: position,
    nextState: State.Text,
  };
};

export const style: Matcher = (c) => {
  const { source, cursor, state } = c;

  if (state !== State.Style) {
    return;
  }
  let position = cursor;

  while (position < source.length) {
    const code = source.charCodeAt(position);

    if (
      code === char.lessThan &&
      source.charCodeAt(position + 1) === char.slash
    ) {
      break;
    }

    // CSS string
    if (code === char.singleQuote || code === char.doubleQuote) {
      position = skip.string(source, position);
      continue;
    }
    // CSS comment
    if (
      code === char.slash &&
      source.charCodeAt(position + 1) === char.asterisk
    ) {
      position = skip.blockComment(source, position);
      continue;
    }

    position++;
  }

  if (position === cursor) {
    return;
  }

  return {
    token: {
      kind: SyntaxKind.Style,
      start: cursor,
      end: position,
      value: source.slice(cursor, position),
    },
    nextCursor: position,
    nextState: State.Text,
  };
};

export const expressionStart: Matcher = (c) => {
  const { source, cursor, state } = c;

  if (state !== State.Text) {
    return;
  }

  if (source.charCodeAt(cursor) !== char.openBrace) {
    return;
  }

  return {
    token: {
      kind: SyntaxKind.ExpressionStart,
      start: cursor,
      end: cursor + 1,
      value: "{",
    },
    nextCursor: cursor + 1,
    nextState: State.Expression,
  };
};

export const expression: Matcher = (c) => {
  const { source, cursor, state } = c;

  if (state !== State.Expression) {
    return;
  }

  const end = skip.braceExpression(source, cursor - 1);

  if (end === -1) {
    // unterminated expression will handle in ast 
    return {
      token: {
        kind: SyntaxKind.Expression,
        start: cursor,
        end: source.length,
        value: source.slice(cursor),
      },
      nextCursor: source.length,
      nextState: State.Text,
    };
  }

  return {
    token: {
      kind: SyntaxKind.Expression,
      start: cursor,
      end: end - 1,
      value: source.slice(cursor, end - 1),
    },
    nextCursor: end - 1,
    nextState: State.Expression,
  };
};

export const expressionEnd: Matcher = (c) => {
  const { source, cursor, state } = c;

  if (state !== State.Expression) {
    return;
  }

  if (source.charCodeAt(cursor) !== char.closeBrace) {
    return;
  }

  return {
    token: {
      kind: SyntaxKind.ExpressionEnd,
      start: cursor,
      end: cursor + 1,
      value: "}",
    },
    nextCursor: cursor + 1,
    nextState: State.Text,
  };
};

export const text: Matcher = (c) => {
  const { source, cursor, state } = c;

  if (state !== State.Text) {
    return;
  }

  let end = cursor;

  while (end < source.length) {
    const code = source.charCodeAt(end);

    if (
      code === char.openBrace ||
      code === char.lessThan
    ) {
      break;
    }

    end++;
  }

  if (end === cursor) {
    return;
  }

  return {
    token: {
      kind: SyntaxKind.Text,
      start: cursor,
      end,
      value: source.slice(cursor, end),
    },
    nextCursor: end,
    nextState: State.Text,
  };
};
