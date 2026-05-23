import { useState, useRef, useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider } from 'reactflow';
import { shallow } from 'zustand/shallow';
import 'reactflow/dist/style.css';
import { useStore } from './store';
import { nodeTypes, SPECS } from './nodes/registry';

const proOptions = { hideAttribution: true };

const selector = (s) => ({
  nodes: s.nodes, edges: s.edges, getNodeID: s.getNodeID, addNode: s.addNode,
  onNodesChange: s.onNodesChange, onEdgesChange: s.onEdgesChange, onConnect: s.onConnect,
  selectNode: s.selectNode, selectEdge: s.selectEdge, clearSelection: s.clearSelection,
});

function PipelineCanvasInner() {
  const wrapRef = useRef(null);
  const [rfInstance, setRfInstance] = useState(null);
  const { nodes, edges, getNodeID, addNode, onNodesChange, onEdgesChange, onConnect, selectNode, selectEdge, clearSelection } = useStore(selector, shallow);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/reactflow');
    if (!raw) return;
    const { nodeType } = JSON.parse(raw);
    if (!nodeType || !SPECS[nodeType]) return;
    const bounds = wrapRef.current.getBoundingClientRect();
    const position = rfInstance.project({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
    const id = getNodeID(nodeType);
    addNode({ id, type: nodeType, position, data: { id, nodeType, ...SPECS[nodeType].defaultData } });
  }, [rfInstance, getNodeID, addNode]);

  const onDragOver = useCallback((e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);

  const onSelectionChange = useCallback(({ nodes: sn, edges: se }) => {
    if (sn.length) selectNode(sn[0].id);
    else if (se.length) selectEdge(se[0].id);
    else clearSelection();
  }, [selectNode, selectEdge, clearSelection]);

  return (
    <div ref={wrapRef} className="vs-canvas-wrap" style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes} edges={edges} nodeTypes={nodeTypes}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={onConnect} onSelectionChange={onSelectionChange}
        onDrop={onDrop} onDragOver={onDragOver} onInit={setRfInstance}
        proOptions={proOptions} snapGrid={[20, 20]} snapToGrid
        connectionLineType="smoothstep" defaultEdgeOptions={{ type: 'smoothstep' }}
        deleteKeyCode={['Backspace', 'Delete']} fitView
      >
        <Background gap={20} size={1} />
        <Controls position="bottom-left" showInteractive={false} />
        <MiniMap position="bottom-right" pannable zoomable
          nodeColor={(n) => { const c = { io:'#3b82f6', llm:'#8b5cf6', data:'#10b981', logic:'#f59e0b' }; return c[SPECS[n.type]?.category] || '#888'; }}
          nodeStrokeWidth={0} maskColor="rgba(246,247,249,0.7)" />
      </ReactFlow>
      {nodes.length === 0 && (
        <div className="vs-empty-hint">
          <div className="vs-empty-hint-inner">
            <div className="vs-empty-hint-title">Build your pipeline</div>
            <div>Drag a node from the left panel onto the canvas to begin.</div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PipelineCanvas() {
  return <ReactFlowProvider><PipelineCanvasInner /></ReactFlowProvider>;
}
