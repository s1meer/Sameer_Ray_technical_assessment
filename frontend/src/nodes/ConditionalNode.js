import { useStore } from '../store';
import { BaseNode } from './BaseNode';
export function ConditionalNode({ id, data }) {
  const upd = useStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} label="Conditional" icon="git-branch" category="logic" width={240}
      inputs={[{id:'value',label:'value'}]}
      outputs={[{id:'true',label:'true'},{id:'false',label:'false'}]}>
      <div className="vs-node-field"><div className="vs-node-label">Condition</div>
        <input className="vs-node-input nodrag" value={data?.expr||''} placeholder="{{score}} > 0.8" onChange={e=>upd(id,{expr:e.target.value})} />
      </div>
    </BaseNode>
  );
}
