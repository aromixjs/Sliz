import { Tokenize } from "../tokenizer/Tokenize";
import { CompilerContext } from "./Context";

export function Compile(Context: CompilerContext) {
  const Tokens = Tokenize(Context);



  return { Tokens };
}
