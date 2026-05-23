import axios from 'axios';

const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export async function parsePipeline(nodes, edges) {
  const payload = {
    nodes: nodes.map((n) => ({ id: n.id, type: n.type, data: n.data, position: n.position })),
    edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle, targetHandle: e.targetHandle })),
  };
  const { data } = await client.post('/pipelines/parse', payload);
  return data;
}
