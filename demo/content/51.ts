export default {
   name: "complex server typescript",
   expected: "stress",
   source: String.raw`<server lang="ts">
import type { User, Product } from "./types";
import { createHash } from "node:crypto";

type Result<T> =
    | { ok: true; value: T }
    | { ok: false; error: Error };

interface Config {
    enabled: boolean;
    retries: number;
    metadata?: Record<string, unknown>;
}

const config: Config = {
    enabled: true,
    retries: 3,
};

const users: User[] = [];

async function loadUser(id: string): Promise<User | null> {
    if (!id) {
        return null;
    }

    const result = await db.users.findOne({
        id,
        active: true,
    });

    return result ?? null;
}

async function updateUser(
    id: string,
    data: Partial<User>
): Promise<Result<User>> {
    try {
        const user = await db.users.update(id, {
            ...data,
            updatedAt: new Date(),
        });

        return {
            ok: true,
            value: user,
        };
    } catch (error) {
        return {
            ok: false,
            error: error instanceof Error
                ? error
                : new Error(String(error)),
        };
    }
}

const result = await loadUser("123");

const hash = createHash("sha256")
    .update(JSON.stringify(result))
    .digest("hex");

const values = [
    1,
    2,
    3,
    ...users.map(user => user.id),
];

const mapped = new Map<string, User>();
const set = new Set<string>();

for (const user of users) {
    mapped.set(user.id, user);
    set.add(user.id);
}

const fn = async <T extends object>(
    value: T
): Promise<T | undefined> => {
    return value;
};
</server>

<div>
    {result?.name}
</div>`,
}
