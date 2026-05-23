import { useState } from 'react';
import { Icon } from './Icon';
import { DraggableNode } from './DraggableNode';
import { SPECS, PALETTE_GROUPS } from '../nodes/specs';

export function Sidebar({ open, onToggle }) {
  const [search, setSearch] = useState('');
  if (!open) {
    return (
      <aside className="vs-sidebar is-collapsed">
        <button className="vs-panel-collapse" onClick={onToggle}><Icon name="panel-left-open" size={14} /></button>
        <div className="vs-rail-label">Node Library</div>
      </aside>
    );
  }
  const groups = PALETTE_GROUPS.map((g) => ({
    ...g,
    items: g.types.map((t) => ({ type: t, ...SPECS[t] }))
      .filter((it) => !search || (it.label + ' ' + it.description).toLowerCase().includes(search.toLowerCase())),
  })).filter((g) => g.items.length > 0);

  return (
    <aside className="vs-sidebar">
      <button className="vs-panel-collapse" onClick={onToggle}><Icon name="panel-left-close" size={14} /></button>
      <div className="vs-sidebar-head">
        <h2 className="vs-sidebar-title">Node Library</h2>
        <div className="vs-search">
          <Icon name="search" size={14} />
          <input type="text" placeholder="Search nodes…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="vs-palette">
        {groups.map((g) => (
          <div key={g.id} className="vs-palette-group">
            <div className="vs-palette-group-header">{g.label}</div>
            {g.items.map((it) => <DraggableNode key={it.type} type={it.type} label={it.label} description={it.description} icon={it.icon} category={it.category} />)}
          </div>
        ))}
      </div>
      <div style={{ padding:'12px 16px', borderTop:'1px solid var(--border-1)', fontSize:11, color:'var(--fg-3)', display:'flex', justifyContent:'space-between' }}>
        <span>Drag onto canvas</span>
        <span>⌘↵ to submit</span>
      </div>
    </aside>
  );
}
