import { useState } from 'react';

export default function KeepersPanel({ keepers, onRemove }) {
  const [status, setStatus] = useState('');

  async function copyAll() {
    const text = keepers.map((k) => k.text).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Copied to clipboard');
    } catch {
      setStatus('Copy failed — select and copy manually');
    }
    setTimeout(() => setStatus(''), 2000);
  }

  function exportFile() {
    const text = keepers.map((k) => k.text).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'splicer-keepers.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="card">
      <h2 className="card-title">KEEPERS</h2>
      {keepers.length === 0 ? (
        <p className="stanza-empty">Pinned lines land here.</p>
      ) : (
        <>
          <div className="keepers-list">
            {keepers.map((k) => (
              <div className="keeper-item" key={k.id}>
                <span className="keeper-text">{k.text}</span>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => onRemove(k.id)}
                  aria-label="Remove from keepers"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="keepers-actions">
            <button className="btn btn-outline" onClick={copyAll} type="button">
              COPY ALL
            </button>
            <button className="btn btn-ghost" onClick={exportFile} type="button">
              EXPORT
            </button>
          </div>
          <p className={`status-msg${status ? ' ok' : ''}`} role="status">{status}</p>
        </>
      )}
    </section>
  );
}
