import { Icon } from './Icon';

export function ValidationModal({ result, error, onClose }) {
  if (!result && !error) return null;
  if (error) {
    return (
      <div className="vs-modal-backdrop" onClick={onClose}>
        <div className="vs-modal" onClick={(e) => e.stopPropagation()}>
          <div className="vs-modal-head"><h2 className="vs-modal-title">Submission Failed</h2><div className="vs-modal-sub">Could not reach the backend.</div></div>
          <div className="vs-modal-body">
            <div className="vs-status-row danger"><Icon name="alert-circle" size={16} />{error}</div>
            <div style={{ fontSize:12, color:'var(--fg-3)', marginTop:12 }}>Make sure the FastAPI server is running: <code>uvicorn main:app --reload</code></div>
          </div>
          <div className="vs-modal-foot"><button className="vs-btn vs-btn-primary" onClick={onClose}>Close</button></div>
        </div>
      </div>
    );
  }
  const { num_nodes, num_edges, is_dag, has_input, has_output, orphans } = result;
  const valid = is_dag && has_input && has_output && orphans === 0;
  return (
    <div className="vs-modal-backdrop" onClick={onClose}>
      <div className="vs-modal" onClick={(e) => e.stopPropagation()}>
        <div className="vs-modal-head">
          <h2 className="vs-modal-title">Pipeline Submitted</h2>
          <div className="vs-modal-sub">{valid ? 'Ready to run — looks good.' : 'Some issues to address before running.'}</div>
        </div>
        <div className="vs-modal-body">
          <div className="vs-stat-row">
            <div className="vs-stat"><div className="vs-stat-label">Nodes</div><div className="vs-stat-val">{num_nodes}</div></div>
            <div className="vs-stat"><div className="vs-stat-label">Connections</div><div className="vs-stat-val">{num_edges}</div></div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <StatusRow ok={is_dag} ok_label="No cycles · pipeline is a DAG" bad_label="Cycle detected — pipeline must be acyclic" />
            <StatusRow ok={has_input} ok_label="Has at least one Input node" bad_label="No Input node — add one to provide data" />
            <StatusRow ok={has_output} ok_label="Has at least one Output node" bad_label="No Output node — add one to capture results" />
            <StatusRow ok={orphans === 0} ok_label="All nodes are connected" bad_label={`${orphans} orphaned node${orphans > 1 ? 's' : ''} — not connected to anything`} />
          </div>
        </div>
        <div className="vs-modal-foot"><button className="vs-btn" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}

function StatusRow({ ok, ok_label, bad_label }) {
  return (
    <div className={`vs-status-row ${ok ? 'success' : 'warn'}`}>
      <Icon name={ok ? 'check-circle-2' : 'alert-circle'} size={16} />
      {ok ? ok_label : bad_label}
    </div>
  );
}
