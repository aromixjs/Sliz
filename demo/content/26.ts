export default {
  name: "26 - error boundary patterns",
  expected: "valid",
  source: String.raw`<server lang="ts">
try {
    const data = await fetchData();
} catch (error) {
    console.error(error);
}

try {
    const result = await riskyOperation();
} catch (e) {
    if (e instanceof ValidationError) {
        return { error: e.message };
    }
    throw e;
} finally {
    cleanup();
}
</server>

<div>
    {error ? <ErrorDisplay error={error} /> : <Content data={data} />}
</div>`,
};
