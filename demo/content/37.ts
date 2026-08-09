export default {
   name: "37 - conditional rendering patterns",
   expected: "valid",
   source: String.raw`<div>
    {condition && <span>Shown</span>}
    {condition ? <span>Yes</span> : <span>No</span>}
    {items.length > 0 && <ul>{items.map(i => <li>{i}</li>)}</ul>}
    {user ? <p>Welcome {user.name}</p> : <p>Please login</p>}
    {error && <div class="error">{error.message}</div>}
    {!loading && <div>{data}</div>}
    {count > 0 ? count : null}
</div>`,
}
