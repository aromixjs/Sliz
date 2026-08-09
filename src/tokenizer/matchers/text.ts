
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
