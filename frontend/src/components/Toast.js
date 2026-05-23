import { Icon } from './Icon';
export function Toast({ message, kind, show }) {
  return (
    <div className={`vs-toast ${kind||''} ${show?'show':''}`}>
      <Icon name={kind==='danger'?'alert-circle':kind==='success'?'check-circle-2':'info'} size={14} />
      {message}
    </div>
  );
}
