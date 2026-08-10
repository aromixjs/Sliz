export default {
  name: "4 - invalid html structure",
  expected: "invalid",
  source: String.raw`<div>
    <p>
        <span>Text</span>
    </p>
    <p>
        More text
    </p>
</div>
<p>Orphan paragraph</p>`,
};
