import { useLayoutEffect, useRef, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Icon } from '../components/Icon';
import { useStore } from '../store';

const HEADER_H = 43;
function handleTop(idx, count, bodyH) {
  if (count <= 1) return HEADER_H + bodyH / 2;
  const span = Math.max(0, bodyH - 36);
  return HEADER_H + 18 + (span / (count - 1)) * idx;
}

export function BaseNode({ id, label, icon, category, width = 240, inputs = [], outputs = [], children }) {
  const deleteNode = useStore((s) => s.deleteNode);
  const duplicateNode = useStore((s) => s.duplicateNode);
  const bodyRef = useRef(null);
  const [bodyH, setBodyH] = useState(80);

  useLayoutEffect(() => {
    if (!bodyRef.current) return;
    const ro = new ResizeObserver(() => { if (bodyRef.current) setBodyH(bodyRef.current.getBoundingClientRect().height); });
    ro.observe(bodyRef.current);
    return () => ro.disconnect();
  }, []);

  const catColors = { io: '#3b82f6', llm: '#8b5cf6', data: '#10b981', logic: '#f59e0b' };
  const c = catColors[category] || '#888';

  return (
    <div className="vs-node" style={{ width }}>
      <div className="vs-node-cat-strip" style={{ background: c }} />
      <div className="vs-node-toolbar">
        <button title="Duplicate" onClick={(e) => { e.stopPropagation(); duplicateNode(id); }}><Icon name="copy" size={13} /></button>
        <button className="danger" title="Delete" onClick={(e) => { e.stopPropagation(); deleteNode(id); }}><Icon name="trash-2" size={13} /></button>
      </div>
      <div className="vs-node-head">
        <div className="vs-node-icon" style={{ background: c + '22', color: c }}><Icon name={icon} size={14} color={c} /></div>
        <div className="vs-node-title">{label}</div>
        <div className="vs-node-id">{id}</div>
      </div>
      <div ref={bodyRef} className="vs-node-body">{children}</div>
      {inputs.map((h, i) => {
        const top = handleTop(i, inputs.length, bodyH);
        return (
          <span key={h.id}>
            <Handle type="target" position={Position.Left} id={h.id} className="vs-handle" style={{ top, borderColor: c }} />
            <span className="vs-handle-label vs-handle-label-left" style={{ top }}>{h.label}</span>
          </span>
        );
      })}
      {outputs.map((h, i) => {
        const top = handleTop(i, outputs.length, bodyH);
        return (
          <span key={h.id}>
            <Handle type="source" position={Position.Right} id={h.id} className="vs-handle" style={{ top, borderColor: c }} />
            <span className="vs-handle-label vs-handle-label-right" style={{ top }}>{h.label}</span>
          </span>
        );
      })}
    </div>
  );
}
