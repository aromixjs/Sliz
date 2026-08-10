export default {
  name: "49 - basic",
  expected: "valid",
  source: String.raw`<script server lang="ts">
const user = await getUser();
const myName = "user";
const username = 'name1';
const backtick = \`data\`;

async function updateName(name) {
    await db.users.update(user.id, { name });
}

const data = await loadData();
</script>

<style></style>

<div .when={user}>
Hello {user.name}
</div>`,
};
