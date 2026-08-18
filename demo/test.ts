import { JsInterpolationResolver } from "@/src";

const resolver1 = new JsInterpolationResolver(`{data}`)
const output1 = resolver1.resolve(0)
console.log(output1);


const resolver2 = new JsInterpolationResolver(`{"data`)
const output2 = resolver2.resolve(0)
console.log(output2);