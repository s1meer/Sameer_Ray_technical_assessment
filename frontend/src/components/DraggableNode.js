import { Icon } from './Icon';
export function DraggableNode({ type, label, description, icon, category }) {
  const onDragStart = (e) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType: type }));
    e.dataTransfer.effectAllowed = 'move';
  };
  return (
    <div className="vs-palette-item" draggable onDragStart={onDragStart}>
      <div className={`vs-palette-icon ${category}`}><Icon name={icon} size={16} /></div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="vs-palette-label">{label}</div>
        <div className="vs-palette-desc">{description}</div>
      </div>
    </div>
  );
}
