import { useStore } from '../store';
import { BaseNode } from './BaseNode';
export function MemoryNode({ id, data }) {
  const upd = useStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} label="Chat Memory" icon="message-square" category="data" width={240}
      inputs={[{id:'turn',label:'turn'}]}
      outputs={[{id:'history',label:'history'}]}>
      <div className="vs-node-field"><div className="vs-node-label">Strategy</div>
        <select className="vs-node-select nodrag" value={data?.strategy||'sliding-window'} onChange={e=>upd(id,{strategy:e.target.value})}>
          <option value="sliding-window">Sliding window</option>
          <option value="summary">Summary</option>
          <option value="full">Full history</option>
        </select>
      </div>
    </BaseNode>
  );
}
