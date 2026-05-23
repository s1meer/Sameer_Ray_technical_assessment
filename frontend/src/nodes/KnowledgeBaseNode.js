import { useStore } from '../store';
import { BaseNode } from './BaseNode';
export function KnowledgeBaseNode({ id, data }) {
  const upd = useStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} label="Knowledge Base" icon="database" category="data" width={260}
      inputs={[{id:'query',label:'query'}]}
      outputs={[{id:'documents',label:'documents'},{id:'scores',label:'scores'}]}>
      <div className="vs-node-field"><div className="vs-node-label">Index</div>
        <select className="vs-node-select nodrag" value={data?.index||'company-handbook'} onChange={e=>upd(id,{index:e.target.value})}>
          {['company-handbook','product-docs','support-tickets','sales-playbook'].map(o=><option key={o}>{o}</option>)}
        </select>
      </div>
      <div style={{display:'flex',gap:6,marginTop:4,flexWrap:'wrap'}}>
        <span className="vs-pill">top-k · {data?.topK||4}</span>
        <span className="vs-pill">{(data?.embedding||'text-embedding-3-small')}</span>
      </div>
    </BaseNode>
  );
}
