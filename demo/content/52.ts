export default {
  name: "52 - unicode",
  expected: "valid",
  source: String.raw`<server>
const name = "Istiuak";
const bangla = "বাংলা";
const arabic = "العربية";
const chinese = "中文";
const japanese = "日本語";
const emoji = "😀 🚀 🌍";
const symbols = "© ™ € £ ¥ ₹";
</server>

<div>
    <h1>বাংলা ভাষা</h1>
    <p>こんにちは世界</p>
    <p>مرحبا بالعالم</p>
    <p>你好世界</p>
    <p>😀 🚀 🌍</p>
</div>`,
};
