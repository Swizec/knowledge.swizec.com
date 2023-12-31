import { useEffect, useState } from "react";
import knowledgeGraph from "/knowledgeGraph.json?url";
import * as d3 from "d3";
import "./App.css";

type Article = {
    url: string;
    title: string;
    published_date: string;
    relatedArticles?: Article[];
};

function Graph(props: { data: Article[] }) {
    const width = 1024,
        height = 600;

    console.log(props.data);

    return (
        <svg
            width={width}
            height={height}
            style={{ border: "1px solid red" }}
        ></svg>
    );
}

function App() {
    const [data, setData] = useState<Article[] | undefined>(undefined);

    useEffect(() => {
        (async () => {
            const data = await d3.json<Article[]>(knowledgeGraph);
            setData(data);
        })();
    }, []);

    return (
        <>
            <h1>swizec.com knowledge graph</h1>

            {!data ? <p>Loading data</p> : null}
            {data ? <Graph data={data} /> : null}
        </>
    );
}

export default App;
