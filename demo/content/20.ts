export default {
  name: "20 - server async patterns",
  expected: "stress",
  source: String.raw`<server lang="ts">
async function fetchData() {
    const response = await fetch("/api/data");
    const data = await response.json();
    return data;
}

async function processAll(items: string[]) {
    const results = await Promise.all(
        items.map(async (item) => {
            const result = await fetch(\`/api/\${item}\`);
            return result.json();
        })
    );
    return results;
}

async function* streamData() {
    for await (const chunk of readableStream) {
        yield chunk;
    }
}

const data = await fetchData();
const results = await processAll(["a", "b", "c"]);
</server>

<div>
    {data?.name}
</div>`,
};
