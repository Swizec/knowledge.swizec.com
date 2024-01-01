import { useEffect, useRef, useState } from "react";
import knowledgeGraph from "/knowledgeGraph.json?url";
import * as d3 from "d3";
import "./App.css";

type Article = {
    url: string;
    title: string;
    published_date: string;
};

type Link = {
    source: string;
    target: string;
    value: number;
};

type KnowledgeGraph = {
    nodes: Article[];
    links: Link[];
};

export type D3RenderFunction = (anchor: HTMLElement | null) => void;

function useD3(render: D3RenderFunction) {
    const refAnchor = useRef(null);

    useEffect(() => {
        render(refAnchor.current);
    });

    return refAnchor;
}

function Graph(props: { nodes: Article[]; links: Link[] }) {
    const width = 1024,
        height = 600;

    // The force simulation mutates links and nodes, so create a copy
    // so that re-evaluating this cell produces the same result.
    const links = props.links.map((d) => ({ ...d }));
    const nodes: (Article & d3.SimulationNodeDatum)[] = props.nodes.map(
        (d) => ({
            ...d,
        })
    );

    const refAnchor = useD3((anchor) => {
        const g = d3.select(anchor);

        const simulation = d3
            .forceSimulation(nodes)
            .force(
                "link",
                d3.forceLink(links).id((d) => d.id)
            )
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2))
            .on("tick", tick);

        const link = g
            .selectAll(".link")
            .data(links)
            .join("line")
            .classed("link", true);

        const node = g
            .selectAll(".node")
            .data(nodes)
            .join("circle")
            .attr("r", 12)
            .classed("node", true);

        function tick() {
            link.attr("x1", (d) => d.source.x)
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);
            node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
        }
    });

    console.log(props);

    return (
        <svg width={width} height={height} style={{ border: "1px solid red" }}>
            <g ref={refAnchor} />
        </svg>
    );
}

function App() {
    const [data, setData] = useState<KnowledgeGraph | undefined>(undefined);

    useEffect(() => {
        (async () => {
            const data = await d3.json<KnowledgeGraph>(knowledgeGraph);
            setData(data);
        })();
    }, []);

    return (
        <>
            <h1>swizec.com knowledge graph</h1>

            {!data ? <p>Loading data</p> : null}
            {data ? <Graph nodes={data.nodes} links={data.links} /> : null}
        </>
    );
}

export default App;
