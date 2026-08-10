export default {
  name: "61 - boolean attributes",
  expected: "valid",
  source: String.raw`<input disabled>
<input disabled />
<input disabled="disabled">
<input ?disabled={isDisabled}>

<button disabled aria-disabled="true">Click</button>

<div hidden></div>
<div ?hidden={isVisible}>Content</div>

<details open>
    <summary>Open by default</summary>
</details>

<video autoplay controls muted></video>`,
};
