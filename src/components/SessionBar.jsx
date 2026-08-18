import { useState } from 'react';

export default function SessionBar({ sessions, onSave, onLoad, onDelete }) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');

  function save() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setStatus(`Saved "${trimmed}"`);
    setTimeout(() => setStatus(''), 2000);
  }

  return (
    <section className="card">
      <h2 className="card-title">SESSIONS</h2>
      <div className="session-row">
        <input
          className="text-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Session name"
          onKeyDown={(e) => e.key === 'Enter' && save()}
        />
        <button className="btn btn-outline btn-small" onClick={save} type="button">
          SAVE
        </button>
      </div>
      {sessions.length > 0 && (
        <div className="session-list">
          {sessions.map((s) => (
            <div className="session-item" key={s.name}>
              <span className="session-name">{s.name}</span>
              <button className="btn btn-ghost btn-small" onClick={() => onLoad(s.name)} type="button">
                LOAD
              </button>
              <button
                type="button"
                className="remove-btn"
                onClick={() => onDelete(s.name)}
                aria-label={`Delete session ${s.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <p className={`status-msg${status ? ' ok' : ''}`} role="status">{status}</p>
    </section>
  );
}
