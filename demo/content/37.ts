export default {
   name: "attribute values",
   expected: "valid",
   source: String.raw`<div
    a="hello"
    b='hello'
    c="hello world"
    d='hello world'
    e={user}
    f={user.name}
    g={user.profile?.name}
    h={items[index]}
    i={foo ? "yes" : "no"}
    j={{ name: "John", age: 20 }}
    k={getValue()}
>
    test
</div>`,
}
