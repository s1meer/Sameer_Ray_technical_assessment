from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict, List
from collections import defaultdict, deque

app = FastAPI(title="VectorShift Pipeline API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Pipeline(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

def check_dag(nodes, edges):
    node_ids = {n["id"] for n in nodes}
    adj = defaultdict(list)
    in_degree = {nid: 0 for nid in node_ids}
    for e in edges:
        src, tgt = e.get("source"), e.get("target")
        if src in node_ids and tgt in node_ids:
            adj[src].append(tgt)
            in_degree[tgt] += 1
    queue = deque(nid for nid, d in in_degree.items() if d == 0)
    visited = 0
    while queue:
        n = queue.popleft(); visited += 1
        for nb in adj[n]:
            in_degree[nb] -= 1
            if in_degree[nb] == 0:
                queue.append(nb)
    return visited == len(node_ids)

@app.get("/")
def root():
    return {"Ping": "Pong"}

@app.post("/pipelines/parse")
def parse_pipeline(pipeline: Pipeline):
    nodes, edges = pipeline.nodes, pipeline.edges
    connected = set()
    for e in edges:
        connected.add(e.get("source"))
        connected.add(e.get("target"))
    return {
        "num_nodes": len(nodes),
        "num_edges": len(edges),
        "is_dag": check_dag(nodes, edges),
        "has_input": any(n.get("type") == "customInput" for n in nodes),
        "has_output": any(n.get("type") == "customOutput" for n in nodes),
        "orphans": sum(1 for n in nodes if n["id"] not in connected),
    }
