// import { Tokenizer, TokenType } from "@/src";
// import { describe, expect, it } from "vitest";

// describe("Tokenize Html Comment", () => {
//   it("tokenizes a simple single-line comment", () => {
//     const tokens = new Tokenizer("<!-- simple comment <!--  -->").tokenize();
//     console.log(tokens);

//     expect(tokens).toStrictEqual([
//       { type: TokenType.HtmlCommentStart, start: 0, end: 4 },
//       {
//         type: TokenType.HtmlCommentContent,
//         start: 4,
//         end: 20,
//         content: " simple comment ",
//       },
//       { type: TokenType.HtmlCommentEnd, start: 20, end: 23 },
//     ]);
//   });

//   it("tokenizes an empty comment", () => {
//     const tokens = new Tokenizer("<!---->").tokenize();

//     expect(tokens).toStrictEqual([
//       { type: TokenType.HtmlCommentStart, start: 0, end: 4 },
//       { type: TokenType.HtmlCommentEnd, start: 4, end: 7 },
//     ]);
//   });

//   it("tokenizes a comment containing HTML tags inside", () => {
//     const input = "<!-- <div><p>Ignored Content</p></div> -->";
//   });
// });
