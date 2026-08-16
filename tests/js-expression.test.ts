import { CharacterCursor, JsResolver, Tokenizer } from "@/src";
import { describe, expect, it } from "vitest";

describe("Resolve JS Expression", () => {
  it("Should Resolve Basic JS", () => {
    const cursor = new CharacterCursor('{userId+ "name"}');
    const output = new JsResolver(cursor).resolve();
    console.log(output);

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
    const output = new JsResolver(cursor).resolve();
    console.log(output);
  });
});
