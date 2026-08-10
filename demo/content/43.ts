export default {
  name: "43 - invalid server block",
  expected: "invalid",
  source: String.raw`<script server>
const user = await getUser();
const data = {
    foo: 1,
`,
};
