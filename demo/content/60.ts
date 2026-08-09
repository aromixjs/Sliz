export default {
   name: "nested mismatched braces",
   expected: "invalid",
   source: String.raw`<div>
    {foo({ bar: { baz: 1 } })}
    {arr.map(x => x.map(y => y))}
    {obj={ nested: { deep: { deeper: 1 } }}}
</div>`,
}
