import { dir } from "console";
import { tokenize } from "../src";
import data from "./content/26";





const result =tokenize({
   source:data.source,
   fileName:'test.sliz',
   diagnostics:[]
})


dir(result,{depth:null})