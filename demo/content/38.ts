export default {
  name: "38 - full component",
  expected: "valid",
  source: String.raw`<server lang="ts">
import { getSession } from "./session";

const session = await getSession();

const user = session?.user ?? null;

async function logout() {
    await session?.destroy();
}

const menu = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Settings", href: "/settings" },
];
</server>

<style>
.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
}

.menu {
    display: flex;
    gap: 1rem;
}

@media (max-width: 640px) {
    .menu {
        flex-direction: column;
    }
}
</style>

<header class="header">
    <div>
        <a href="/">My App</a>
    </div>

    <nav class="menu">
        {menu.map(item => (
            <a href={item.href}>
                {item.label}
            </a>
        ))}
    </nav>

    <div .when={user}>
        <span>{user.name}</span>
        <button .onclick={logout}>
            Logout
        </button>
    </div>

    <div .when={!user}>
        <a href="/login">
            Login
        </a>
    </div>
</header>`,
};
