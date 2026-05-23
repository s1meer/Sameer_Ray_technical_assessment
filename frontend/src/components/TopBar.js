import { useStore } from '../store';
import { Icon } from './Icon';
import { BrandMark } from './BrandMark';

export function TopBar({ saveState, onClear, onSubmit, submitting }) {
  const pipelineName = useStore((s) => s.pipelineName);
  const setPipelineName = useStore((s) => s.setPipelineName);
  return (
    <div className="vs-topbar">
      <div className="vs-brand">
        <div className="vs-brand-mark"><BrandMark size={26} /></div>
        <div>
          <div className="vs-brand-name">Vector Shift</div>
          <div className="vs-brand-sub">Pipeline Studio</div>
        </div>
      </div>
      <div className="vs-breadcrumbs">
        <span className="vs-crumb">My Pipelines</span>
        <span className="vs-crumb-sep"><Icon name="chevron-right" size={14} /></span>
        <input className="vs-pipeline-name" value={pipelineName} onChange={(e) => setPipelineName(e.target.value)} spellCheck={false} />
        <span className={`vs-save-state ${saveState}`}>
          <span className="dot" />
          {saveState === 'saved' ? 'Saved' : 'Saving…'}
        </span>
      </div>
      <div className="vs-topbar-actions">
        <button className="vs-btn vs-btn-ghost" onClick={onClear}>
          <Icon name="trash" size={14} /> Clear
        </button>
        <button className="vs-btn vs-btn-run" onClick={onSubmit} disabled={submitting} title="Submit pipeline (⌘↵)">
          <Icon name={submitting ? 'loader-2' : 'play'} size={14} />
          {submitting ? 'Submitting…' : 'Submit Pipeline'}
        </button>
      </div>
    </div>
  );
}
