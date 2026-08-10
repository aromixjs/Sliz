import { tokenize } from "../Tokenizer/Tokenize";
import { CompilerContext } from "./Context";

export function compile(context: CompilerContext) {
  const tokens = tokenize(context);
  return { tokens };
}
