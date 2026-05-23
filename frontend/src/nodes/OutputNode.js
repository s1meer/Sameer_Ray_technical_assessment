import { useStore } from '../store';
import { BaseNode } from './BaseNode';
export function OutputNode({ id, data }) {
  const upd = useStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} label="Output" icon="log-out" category="io" width={240} inputs={[{id:'value',label:'value'}]} outputs={[]}>
      <div className="vs-node-field"><div className="vs-node-label">Name</div><input className="vs-node-input nodrag" value={data?.name||''} onChange={e=>upd(id,{name:e.target.value})} /></div>
      <div className="vs-node-field"><div className="vs-node-label">Type</div>
        <select className="vs-node-select nodrag" value={data?.dataType||'Text'} onChange={e=>upd(id,{dataType:e.target.value})}>
          {['Text','JSON','Image','Audio'].map(o=><option key={o}>{o}</option>)}
        </select>
      </div>
    </BaseNode>
  );
}
