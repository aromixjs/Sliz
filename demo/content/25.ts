export default {
   name: "complex expressions",
   expected: "stress",
   source: String.raw`<div>
    {user.name}
    {user?.profile?.name}
    {items[0]}
    {items[index]}
    {items[index]?.name}
    {foo ? bar : baz}
    {foo && bar}
    {foo || bar}
    {!foo}
    {a + b * c}
    {fn(a, b, c)}
    {foo({ a: 1, b: 2 })}
    {condition ? user.name : "Anonymous"}
    {items.map(item => item.name)}
</div>`,
}
