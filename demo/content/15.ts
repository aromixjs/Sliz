export default {
  name: "15 - self closing tags",
  expected: "valid",
  source: String.raw`<div>
    <img src="/image.png" alt="Image" />
    <input type="text" />
    <input type="checkbox" disabled />
    <br />
    <hr/>
    <custom-element foo="bar"/>
</div>`,
};
