import { SlizTokenizer } from "@/src";
import { describe, expect, it } from "vitest";

describe("Sliz Tokenizer", () => {
  it("Should Tokenize Basic Input", () => {
    const output = new SlizTokenizer(`<div>{}</div>`).tokenize();
    console.log(output);
  });

  it("Should Tokenize Html Comment", () => {
    const output = new SlizTokenizer(`<!-- Test -->`).tokenize();
    console.log(output);
  });
});
