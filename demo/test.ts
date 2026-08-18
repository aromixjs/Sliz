import { JsInterpolationResolver } from "@/src";

const resolver = new JsInterpolationResolver(`{data}`)


const output = resolver.resolve(0)

console.log(output);
