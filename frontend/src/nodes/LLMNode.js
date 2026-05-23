import { useStore } from '../store';
import { BaseNode } from './BaseNode';
export function LLMNode({ id, data }) {
  const upd = useStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} label="LLM" icon="sparkles" category="llm" width={240}
      inputs={[{id:'system',label:'system'},{id:'prompt',label:'prompt'}]}
      outputs={[{id:'response',label:'response'}]}>
      <div className="vs-node-field"><div className="vs-node-label">Model</div>
        <select className="vs-node-select nodrag" value={data?.model||'gpt-4o'} onChange={e=>upd(id,{model:e.target.value})}>
          {['gpt-4o','gpt-4o-mini','claude-sonnet-4','claude-opus-4','llama-3.1-70b'].map(o=><option key={o}>{o}</option>)}
        </select>
      </div>
      <div style={{display:'flex',gap:6,marginTop:4}}>
        <span className="vs-pill">temp · {Number(data?.temperature??0.7).toFixed(1)}</span>
        <span className="vs-pill">max · {data?.maxTokens||1024}</span>
      </div>
    </BaseNode>
  );
}
