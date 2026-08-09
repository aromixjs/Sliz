export default {
   name: "event handlers complex",
   expected: "valid",
   source: String.raw`<button .onclick={() => handleClick()}>Click</button>
<button .onclick={handleClick}>Click</button>
<button .onclick={(e) => handleClick(e)}>Click</button>
<button .onclick={handleClick.bind(null, arg)}>Click</button>

<input .oninput={(e) => setValue(e.target.value)}>
<input .onkeydown={(e) => { if (e.key === 'Enter') submit(); }}>

<div .onmouseover={() => setHover(true)} .onmouseout={() => setHover(false)}>
    Hover me
</div>`,
}
