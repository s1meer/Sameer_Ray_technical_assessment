import { useStore } from '../store';
import { BaseNode } from './BaseNode';
export function InputNode({ id, data }) {
  const upd = useStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} label="Input" icon="log-in" category="io" width={240} inputs={[]} outputs={[{id:'value',label:'value'}]}>
      <div className="vs-node-field"><div className="vs-node-label">Name</div><input className="vs-node-input nodrag" value={data?.name||''} onChange={e=>upd(id,{name:e.target.value})} /></div>
      <div className="vs-node-field"><div className="vs-node-label">Type</div>
        <select className="vs-node-select nodrag" value={data?.dataType||'Text'} onChange={e=>upd(id,{dataType:e.target.value})}>
          {['Text','File','JSON','Audio'].map(o=><option key={o}>{o}</option>)}
        </select>
      </div>
    </BaseNode>
  );
}
