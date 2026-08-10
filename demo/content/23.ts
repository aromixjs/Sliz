export default {
  name: "23 - complex object destructuring",
  expected: "stress",
  source: String.raw`<script server lang="ts">
const {
    user: { name, email, profile: { avatar, bio } },
    settings: { theme, language },
    metadata: { createdAt, updatedAt },
} = await getUserData();

const [first, second, ...rest] = await getItems();

const {
    data,
    error,
    status,
} = await fetchData();

function process({
    id,
    name,
    nested: { value },
    array: [item1, item2],
}: ProcessInput) {
    return { id, name, value, item1, item2 };
}
</script>

<div>
    {name}
</div>`,
};
