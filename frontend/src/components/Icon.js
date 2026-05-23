import { useEffect, useRef } from 'react';
export function Icon({ name, size = 16, color, strokeWidth = 1.75 }) {
  const ref = useRef(null);
  useEffect(() => { if (window.lucide && ref.current) { try { window.lucide.createIcons(); } catch {} } }, [name]);
  return <i ref={ref} data-lucide={name} style={{ width: size, height: size, color: color || 'currentColor', strokeWidth, display: 'inline-flex' }} />;
}
