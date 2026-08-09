export default {
   name: "nested expressions",
   expected: "stress",
   source: String.raw`<div
    data={foo({
        user: {
            name: user.name,
            roles: ["admin", "editor"],
            metadata: {
                active: true,
                count: items.length,
            },
        },
        values: [1, 2, 3],
    })}
>
    {JSON.stringify(user)}
</div>`,
}
