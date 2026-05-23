import { useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const extractVars = (text) => {
  const re = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;
  const seen = new Set(); let m;
  while ((m = re.exec(text)) !== null) seen.add(m[1]);
  return [...seen];
};

export function TextNode({ id, data }) {
  const upd = useStore((s) => s.updateNodeData);
  const init = data?.text ?? '{{input}}';
  const [text, setText] = useState(init);
  const [vars, setVars] = useState(extractVars(init));
  const [width, setWidth] = useState(280);
  const taRef = useRef(null);

  const resize = useCallback((val) => {
    const max = Math.max(...val.split('\n').map(l => l.length), 26);
    setWidth(Math.max(280, max * 7.6 + 60));
    if (taRef.current) {
      taRef.current.style.height = 'auto';
      taRef.current.style.height = taRef.current.scrollHeight + 'px';
    }
  }, []);

  useEffect(() => { resize(init); }, []); // eslint-disable-line

  const onChange = (e) => {
    const v = e.target.value;
    setText(v); setVars(extractVars(v)); resize(v); upd(id, { text: v });
  };

  return (
    <BaseNode id={id} label="Text" icon="type" category="logic" width={width} inputs={[]} outputs={[{id:'output',label:'output'}]}>
      <div className="vs-node-field">
        <div className="vs-node-label">Template</div>
        <textarea ref={taRef} className="vs-node-textarea nodrag" value={text} onChange={onChange} rows={1} spellCheck={false} style={{width:'100%'}} />
      </div>
      {vars.length > 0 && (
        <div className="vs-node-vars">{vars.map(v => <span key={v} className="vs-node-var-badge">{v}</span>)}</div>
      )}
      {vars.map((v, i) => {
        const t = vars.length === 1 ? 68 : Math.round(((i + 1) / (vars.length + 1)) * 100);
        return (
          <span key={v}>
            <Handle type="target" position={Position.Left} id={v} className="vs-handle" style={{ top: `${t}%`, borderColor: '#f59e0b' }} />
            <span className="vs-handle-label vs-handle-label-left" style={{ top: `${t}%` }}>{v}</span>
          </span>
        );
      })}
    </BaseNode>
  );
}
