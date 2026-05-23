import { Icon } from './Icon';
import { useStore } from '../store';
import { SPECS } from '../nodes/specs';
import { extractVars } from '../nodes/TextNode';

function Field({ label, help, children }) {
  return (
    <div className="vs-field">
      <div className="vs-field-label">{label}</div>
      {children}
      {help && <div className="vs-field-help">{help}</div>}
    </div>
  );
}

function InputForm({ node, update }) {
  return (
    <>
      <Field label="Variable name"><input className="vs-input" value={node.data?.name||''} onChange={e=>update('name',e.target.value)} /></Field>
      <Field label="Data type"><select className="vs-select" value={node.data?.dataType||'Text'} onChange={e=>update('dataType',e.target.value)}>{['Text','File','JSON','Audio'].map(o=><option key={o}>{o}</option>)}</select></Field>
    </>
  );
}
function OutputForm({ node, update }) {
  return (
    <>
      <Field label="Output name"><input className="vs-input" value={node.data?.name||''} onChange={e=>update('name',e.target.value)} /></Field>
      <Field label="Output type"><select className="vs-select" value={node.data?.dataType||'Text'} onChange={e=>update('dataType',e.target.value)}>{['Text','JSON','Image','Audio'].map(o=><option key={o}>{o}</option>)}</select></Field>
    </>
  );
}
function LLMForm({ node, update }) {
  const temp = Number(node.data?.temperature ?? 0.7);
  return (
    <>
      <Field label="Model"><select className="vs-select" value={node.data?.model||'gpt-4o'} onChange={e=>update('model',e.target.value)}>{['gpt-4o','gpt-4o-mini','claude-sonnet-4','claude-opus-4','llama-3.1-70b'].map(o=><option key={o}>{o}</option>)}</select></Field>
      <Field label="Temperature">
        <div className="vs-slider-row"><input type="range" min="0" max="1" step="0.1" value={temp} className="vs-slider" onChange={e=>update('temperature',parseFloat(e.target.value))} /><span className="vs-slider-val">{temp.toFixed(1)}</span></div>
      </Field>
      <Field label="Max tokens"><input className="vs-input" type="number" value={node.data?.maxTokens||1024} onChange={e=>update('maxTokens',parseInt(e.target.value)||0)} /></Field>
    </>
  );
}
function TextForm({ node, update }) {
  const vars = extractVars(node.data?.text || '');
  return (
    <>
      <Field label="Template" help="Variables in {{double-braces}} become input handles."><textarea className="vs-textarea" rows={6} value={node.data?.text||''} onChange={e=>update('text',e.target.value)} /></Field>
      <Field label="Detected variables"><div className="vs-pill-row">{vars.length===0?<span style={{fontSize:12,color:'var(--fg-3)'}}>None</span>:vars.map(v=><span key={v} className="vs-pill active">{v}</span>)}</div></Field>
    </>
  );
}
function APIForm({ node, update }) {
  return (
    <>
      <Field label="Method"><select className="vs-select" value={node.data?.method||'POST'} onChange={e=>update('method',e.target.value)}>{['GET','POST','PUT','DELETE'].map(m=><option key={m}>{m}</option>)}</select></Field>
      <Field label="URL"><input className="vs-input" value={node.data?.url||''} onChange={e=>update('url',e.target.value)} placeholder="https://api.example.com/..." /></Field>
    </>
  );
}
function KBForm({ node, update }) {
  return (
    <>
      <Field label="Index"><select className="vs-select" value={node.data?.index||'company-handbook'} onChange={e=>update('index',e.target.value)}>{['company-handbook','product-docs','support-tickets','sales-playbook'].map(o=><option key={o}>{o}</option>)}</select></Field>
      <Field label="top-k"><div className="vs-slider-row"><input type="range" min="1" max="20" step="1" className="vs-slider" value={node.data?.topK||4} onChange={e=>update('topK',parseInt(e.target.value))} /><span className="vs-slider-val">{node.data?.topK||4}</span></div></Field>
    </>
  );
}
function ConditionalForm({ node, update }) {
  return <Field label="Condition"><input className="vs-input" value={node.data?.expr||''} onChange={e=>update('expr',e.target.value)} placeholder="{{score}} > 0.8" /></Field>;
}
function MemoryForm({ node, update }) {
  return (
    <Field label="Strategy"><select className="vs-select" value={node.data?.strategy||'sliding-window'} onChange={e=>update('strategy',e.target.value)}><option value="sliding-window">Sliding window</option><option value="summary">Summary</option><option value="full">Full history</option></select></Field>
  );
}

const FORMS = { customInput:InputForm, customOutput:OutputForm, llm:LLMForm, text:TextForm, api:APIForm, knowledgeBase:KBForm, conditional:ConditionalForm, memory:MemoryForm };

export function Inspector({ open, onToggle }) {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const selectedEdgeId = useStore((s) => s.selectedEdgeId);
  const updateNodeData = useStore((s) => s.updateNodeData);
  const deleteNode = useStore((s) => s.deleteNode);
  const deleteEdge = useStore((s) => s.deleteEdge);

  const node = nodes.find((n) => n.id === selectedNodeId) || null;
  const edge = edges.find((e) => e.id === selectedEdgeId) || null;

  if (!open) {
    return (
      <aside className="vs-inspector is-collapsed">
        <button className="vs-panel-collapse" onClick={onToggle}><Icon name="panel-right-open" size={14} /></button>
        <div className="vs-rail-label">Inspector</div>
      </aside>
    );
  }
  if (!node && !edge) {
    return (
      <aside className="vs-inspector">
        <button className="vs-panel-collapse" onClick={onToggle}><Icon name="panel-right-close" size={14} /></button>
        <div className="vs-empty-inspector">
          <div className="icon-wrap"><Icon name="mouse-pointer-2" size={18} /></div>
          <div>Select a node or edge to inspect.</div>
        </div>
        <div style={{ marginTop:'auto', padding:'16px 20px', borderTop:'1px solid var(--border-1)' }}>
          <div className="vs-inspector-section-title">Pipeline Stats</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:13 }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:'var(--fg-3)' }}>Nodes</span><span style={{ fontWeight:500 }}>{nodes.length}</span></div>
            <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:'var(--fg-3)' }}>Connections</span><span style={{ fontWeight:500 }}>{edges.length}</span></div>
          </div>
        </div>
      </aside>
    );
  }
  if (edge) {
    return (
      <aside className="vs-inspector">
        <button className="vs-panel-collapse" onClick={onToggle}><Icon name="panel-right-close" size={14} /></button>
        <div className="vs-inspector-head">
          <div className="vs-inspector-icon" style={{ background:'#e4f2f2', color:'#1E7375' }}><Icon name="git-branch" size={16} /></div>
          <div><div className="vs-inspector-title">Connection</div><div className="vs-inspector-subtitle">{edge.id}</div></div>
        </div>
        <div className="vs-inspector-body">
          <button className="vs-btn" style={{ color:'#EF4444', borderColor:'#FEF2F2' }} onClick={() => deleteEdge(edge.id)}><Icon name="trash-2" size={14} />Delete Connection</button>
        </div>
      </aside>
    );
  }
  const spec = SPECS[node.type] || {};
  const catColors = { io:'#3b82f6', llm:'#8b5cf6', data:'#10b981', logic:'#f59e0b' };
  const c = catColors[spec.category] || '#888';
  const Form = FORMS[node.type] || (() => null);
  const update = (field, value) => updateNodeData(node.id, { [field]: value });
  return (
    <aside className="vs-inspector">
      <button className="vs-panel-collapse" onClick={onToggle}><Icon name="panel-right-close" size={14} /></button>
      <div className="vs-inspector-head">
        <div className="vs-inspector-icon" style={{ background: c + '22', color: c }}><Icon name={spec.icon||'box'} size={16} /></div>
        <div style={{ minWidth:0, flex:1 }}>
          <div className="vs-inspector-title">{spec.label||node.type}</div>
          <div className="vs-inspector-subtitle">{node.id}</div>
        </div>
        <button className="vs-btn vs-btn-icon" onClick={() => deleteNode(node.id)} style={{ color:'#EF4444' }}><Icon name="trash-2" size={14} /></button>
      </div>
      <div className="vs-inspector-body">
        <div>
          <div className="vs-inspector-section-title">Configuration</div>
          <Form node={node} update={update} />
        </div>
      </div>
    </aside>
  );
}
