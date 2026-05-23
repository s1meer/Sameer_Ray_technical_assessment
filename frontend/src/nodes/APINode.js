import { useStore } from '../store';
import { BaseNode } from './BaseNode';
export function APINode({ id, data }) {
  const upd = useStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} label="API Call" icon="cable" category="data" width={280}
      inputs={[{id:'input',label:'input'}]}
      outputs={[{id:'response',label:'response'},{id:'status',label:'status'}]}>
      <div className="vs-node-field"><div className="vs-node-label">Method · URL</div>
        <div style={{display:'flex',gap:4}}>
          <select className="vs-node-select nodrag" style={{width:64,flexShrink:0}} value={data?.method||'POST'} onChange={e=>upd(id,{method:e.target.value})}>
            {['GET','POST','PUT','DELETE'].map(m=><option key={m}>{m}</option>)}
          </select>
          <input className="vs-node-input nodrag" value={data?.url||''} placeholder="https://..." onChange={e=>upd(id,{url:e.target.value})} />
        </div>
      </div>
    </BaseNode>
  );
}
