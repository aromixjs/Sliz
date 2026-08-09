export default {
   name: "32 - accessibility attributes",
   expected: "valid",
   source: String.raw`<div
    role="dialog"
    aria-labelledby="title"
    aria-describedby="desc"
    aria-modal="true"
    aria-hidden="false"
    aria-live="polite"
    aria-atomic="true"
    aria-relevant="additions"
    aria-busy="false"
    aria-controls="panel"
    aria-owns="menu"
    aria-activedescendant="item-1"
    aria-colcount="3"
    aria-colindex="1"
    aria-colspan="2"
    aria-rowcount="10"
    aria-rowindex="1"
    aria-rowspan="2"
    aria-level="2"
    aria-setsize="5"
    aria-posinset="1"
>
    <h1 id="title">Dialog</h1>
    <p id="desc">Description</p>
</div>`,
}
