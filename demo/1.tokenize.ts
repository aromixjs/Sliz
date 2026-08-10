import { dir } from "console";
import { tokenize } from "../src/index";

const source = `
<div class="min-h-screen bg-gray-50">
  <header class="border-b bg-white">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      <div class="flex items-center gap-4">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            class="h-10 w-10 rounded-full"
          />
        ) : (
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div>
          <h1 class="font-semibold">{user.name}</h1>
          <p class="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <span
          class={
            user.active
              ? "rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
              : "rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
          }
        >
          {user.active ? "Active" : "Inactive"}
        </span>

        <span class="rounded-md bg-gray-100 px-3 py-1 text-sm">
          {user.role}
        </span>
      </div>
    </div>
  </header>

  <main class="mx-auto max-w-7xl px-6 py-8">
    <section class="mb-8 grid gap-4 md:grid-cols-3">
      <div class="rounded-xl border bg-white p-6">
        <p class="text-sm text-gray-500">Projects</p>
        <p class="mt-2 text-3xl font-semibold">
          {stats.projects}
        </p>
      </div>

      <div class="rounded-xl border bg-white p-6">
        <p class="text-sm text-gray-500">Members</p>
        <p class="mt-2 text-3xl font-semibold">
          {stats.members}
        </p>
      </div>

      <div class="rounded-xl border bg-white p-6">
        <p class="text-sm text-gray-500">Account status</p>
        <p class="mt-2 text-3xl font-semibold">
          {stats.active ? "Active" : "Inactive"}
        </p>
      </div>
    </section>

    <section class="rounded-xl border bg-white">
      <div class="flex items-center justify-between border-b px-6 py-5">
        <div>
          <h2 class="text-lg font-semibold">Projects</h2>
          <p class="text-sm text-gray-500">
            Projects currently associated with {user.name}.
          </p>
        </div>

        <button
          class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          onclick={() => handleInvite("new@example.com")}
        >
          Invite member
        </button>
      </div>

      {projects.length > 0 ? (
        <div class="divide-y">
          {projects.map((project) => (
            <article class="p-6">
              <div class="flex items-start justify-between gap-6">
                <div class="min-w-0">
                  <div class="flex items-center gap-3">
                    <h3 class="font-semibold">
                      {project.name}
                    </h3>

                    <span
                      class={
                        project.status === "active"
                          ? "rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"
                          : "rounded-full bg-gray-100 px-2 py-1 text-xs"
                      }
                    >
                      {project.status}
                    </span>
                  </div>

                  <p class="mt-2 text-sm text-gray-600">
                    {project.description}
                  </p>
                </div>

                <button
                  class="shrink-0 rounded-lg border px-3 py-2 text-sm"
                  onclick={() => handleArchive(project.id)}
                >
                  Archive
                </button>
              </div>

              {project.members.length > 0 && (
                <div class="mt-5">
                  <p class="mb-3 text-xs font-medium uppercase text-gray-400">
                    Members
                  </p>

                  <div class="flex flex-wrap gap-2">
                    {project.members.map((member) => (
                      <div class="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            class="h-7 w-7 rounded-full"
                          />
                        ) : (
                          <div class="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs">
                            {member.name.charAt(0)}
                          </div>
                        )}

                        <div>
                          <p class="text-sm font-medium">
                            {member.name}
                          </p>
                          <p class="text-xs text-gray-500">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div class="px-6 py-16 text-center">
          <h3 class="font-medium">No projects found</h3>
          <p class="mt-1 text-sm text-gray-500">
            This user does not have any active projects.
          </p>

          <button
            class="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
            onclick={() => handleInvite("new@example.com")}
          >
            Invite to a project
          </button>
        </div>
      )}
    </section>

    <section class="mt-8 grid gap-6 lg:grid-cols-2">
      <div class="rounded-xl border bg-white p-6">
        <h2 class="font-semibold">Account details</h2>

        <dl class="mt-5 space-y-4">
          <div class="flex justify-between gap-4">
            <dt class="text-sm text-gray-500">User ID</dt>
            <dd class="font-mono text-sm">{user.id}</dd>
          </div>

          <div class="flex justify-between gap-4">
            <dt class="text-sm text-gray-500">Email</dt>
            <dd class="text-sm">{user.email}</dd>
          </div>

          <div class="flex justify-between gap-4">
            <dt class="text-sm text-gray-500">Role</dt>
            <dd class="text-sm">{user.role}</dd>
          </div>

          <div class="flex justify-between gap-4">
            <dt class="text-sm text-gray-500">Status</dt>
            <dd class="text-sm">
              {user.active ? "Active" : "Inactive"}
            </dd>
          </div>
        </dl>
      </div>

      <div class="rounded-xl border bg-white p-6">
        <h2 class="font-semibold">Recent activity</h2>

        <div class="mt-5 space-y-4">
          {[
            {
              action: "Updated profile",
              date: new Date(),
            },
            {
              action: "Joined project",
              date: new Date(),
            },
            {
              action: "Updated account settings",
              date: new Date(),
            },
          ].map((activity) => (
            <div class="flex items-center justify-between border-b pb-4 last:border-0">
              <span class="text-sm">{activity.action}</span>
              <time class="text-xs text-gray-500">
                {formatDate(activity.date)}
              </time>
            </div>
          ))}
        </div>
      </div>
    </section>
  </main>
</div>
`;

const result = tokenize({
  source: source,
  fileName: "test.sliz",
  diagnostics: [],
});

dir(result, { depth: null });
