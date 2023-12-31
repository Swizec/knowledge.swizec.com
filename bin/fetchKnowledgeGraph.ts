import { createClient } from "@vercel/postgres";

const client = createClient({
    connectionString: process.env.POSTGRES_URL_NON_POOLING,
});
await client.connect();

try {
    // We get all articles then fetch related for each and make nodes
    // This approach is N+1 but that's likely faster than a self-join
    const { rows: articles } =
        await client.sql`select url, title from article_embeddings`;

    const nodes = [];

    for (const { url, title } of articles) {
        console.log(`Fetching ${url}`);

        const { rows } =
            await client.sql`select url, title, published_date from article_embeddings where url <> ${url} order by embedding <-> (select embedding from article_embeddings where url = ${url} limit 1) asc, published_date desc limit 5`;

        const node = {
            url,
            title,
            relatedArticles: rows,
        };

        nodes.push(node);
    }

    Bun.write("src/knowledgeGraph.json", JSON.stringify(nodes));
} catch (e) {
    console.error(e);
    throw e;
} finally {
    await client.end();
}
