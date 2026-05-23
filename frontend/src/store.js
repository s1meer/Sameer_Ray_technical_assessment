import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges, MarkerType } from 'reactflow';

export const useStore = create((set, get) => ({
  nodes: [],
  edges: [],
  nodeIDs: {},
  selectedNodeId: null,
  selectedEdgeId: null,
  pipelineName: 'Untitled Pipeline',

  getNodeID: (type) => {
    const ids = { ...get().nodeIDs };
    ids[type] = (ids[type] || 0) + 1;
    set({ nodeIDs: ids });
    return `${type}-${ids[type]}`;
  },

  addNode: (node) => set({ nodes: [...get().nodes, node] }),
  onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),
  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),

  onConnect: (connection) => set({
    edges: addEdge({
      ...connection,
      type: 'smoothstep',
      animated: false,
      markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: '#2E8E91' },
    }, get().edges),
  }),

  updateNodeField: (nodeId, fieldName, fieldValue) => set({
    nodes: get().nodes.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, [fieldName]: fieldValue } } : n),
  }),

  updateNodeData: (nodeId, patch) => set({
    nodes: get().nodes.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n),
  }),

  deleteNode: (nodeId) => set({
    nodes: get().nodes.filter((n) => n.id !== nodeId),
    edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
  }),

  deleteEdge: (edgeId) => set({
    edges: get().edges.filter((e) => e.id !== edgeId),
    selectedEdgeId: get().selectedEdgeId === edgeId ? null : get().selectedEdgeId,
  }),

  duplicateNode: (nodeId) => {
    const n = get().nodes.find((nn) => nn.id === nodeId);
    if (!n) return;
    const newId = get().getNodeID(n.type);
    set({ nodes: [...get().nodes, { ...n, id: newId, position: { x: n.position.x + 24, y: n.position.y + 24 }, data: { ...n.data, id: newId }, selected: false }], selectedNodeId: newId });
  },

  selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
  clearSelection: () => set({ selectedNodeId: null, selectedEdgeId: null }),
  setPipelineName: (name) => set({ pipelineName: name }),

  loadPipeline: ({ nodes, edges, nodeIDs, name }) => set({
    nodes, edges, nodeIDs: nodeIDs || {},
    pipelineName: name || 'Untitled Pipeline',
    selectedNodeId: null, selectedEdgeId: null,
  }),

  clearPipeline: () => set({ nodes: [], edges: [], nodeIDs: {}, selectedNodeId: null, selectedEdgeId: null }),
}));
