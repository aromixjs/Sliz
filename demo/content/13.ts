export default {
   name: "fragment syntax",
   expected: "valid",
   source: String.raw`<>
    <div>First</div>
    <div>Second</div>
</>

<>
    {items.map(item => <span key={item.id}>{item.name}</span>)}
</>

<>
    {condition && <div>Conditional</div>}
    <div>Always</div>
</>`,
}
