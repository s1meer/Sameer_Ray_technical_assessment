import { useState, useEffect, useRef } from 'react';
import { useStore } from './store';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { Inspector } from './components/Inspector';
import { ValidationModal } from './components/ValidationModal';
import { Toast } from './components/Toast';
import { PipelineCanvas } from './ui';
import { parsePipeline } from './api';

function App() {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const clearPipeline = useStore((s) => s.clearPipeline);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saveState, setSaveState] = useState('saved');
  const [toast, setToast] = useState({ show: false, msg: '', kind: 'info' });
  const saveTimer = useRef(null);

  const flashToast = (msg, kind) => {
    setToast({ show: true, msg, kind });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
  };

  useEffect(() => {
    setSaveState('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaveState('saved'), 600);
    return () => clearTimeout(saveTimer.current);
  }, [nodes, edges]);

  const onSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const r = await parsePipeline(nodes, edges);
      setResult(r);
    } catch (e) {
      const msg = e.response ? `${e.response.status} ${e.response.statusText}` : e.message || 'Network error';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const onKey = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); onSubmit(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nodes, edges]); // eslint-disable-line

  const onClear = () => { clearPipeline(); flashToast('Canvas cleared', 'info'); };

  return (
    <div className="vs-app" style={{ gridTemplateColumns: `${sidebarOpen ? 280 : 44}px 1fr ${inspectorOpen ? 300 : 44}px` }}>
      <TopBar saveState={saveState} submitting={submitting} onSubmit={onSubmit} onClear={onClear} />
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />
      <PipelineCanvas />
      <Inspector open={inspectorOpen} onToggle={() => setInspectorOpen((v) => !v)} />
      <ValidationModal result={result} error={error} onClose={() => { setResult(null); setError(null); }} />
      <Toast message={toast.msg} kind={toast.kind} show={toast.show} />
    </div>
  );
}

export default App;
