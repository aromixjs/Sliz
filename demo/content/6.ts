export default {
   name: "attribute value edge cases",
   expected: "stress",
   source: String.raw`<div
    a=""
    b=''
    c=""
    d=''
    e=" "
    f=' '
    g="hello world"
    h='hello world'
    i="it's"
    j="he said \"hello\""
    k='she said \'hello\''
    l="special <tag>"
    m="special {expr}"
    n="special </tag>"
></div>`,
}
