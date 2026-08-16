import { Tokenizer } from "@/src";
import { describe, expect, it } from "vitest";

describe("Tokenize Html Tag", () => {
  it("Should Tokenize Basic Html Tag", () => {
    const tokens = new Tokenizer("<!doctype id={userID       class=bg:red:bg red >").tokenize();

    console.log(tokens);
  });
});
