import { JsExprTokenizer } from "@/src";
import { describe, it } from "vitest";

describe("Resolve JS Expression", () => {
   it("Should Resolve Basic JS", () => {
      const output = new JsExprTokenizer('{userId+ "name"}').tokenize();
      console.log(output);


   });
});
