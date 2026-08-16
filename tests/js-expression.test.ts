import { CharacterCursor, resolveJsExpression, Tokenizer } from "@/src";
import { describe, expect, it } from "vitest";

describe("Resolve JS Expression", () => {
  it("Should Resolve Basic JS", () => {
    const cursor = new CharacterCursor('{userId+ "name"}');
    const output = resolveJsExpression(cursor);

    expect(output).toStrictEqual({
      status: "closed",
      end: cursor.source.length,
      issues: [],
    });
  });

  it("Should Resolve Unterminated Expression", () => {
    const cursor = new CharacterCursor(`{userId+ "name}
    
    }
    `);
    const output = resolveJsExpression(cursor);
    console.log(output);
  });
});
