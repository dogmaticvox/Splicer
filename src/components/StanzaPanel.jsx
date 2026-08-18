export default function StanzaPanel({ stanza, keeperTexts, onTogglePin }) {
  return (
    <section className="card">
      <h2 className="card-title">STANZA</h2>
      {stanza.length === 0 ? (
        <p className="stanza-empty">Add source text and hit shuffle to generate a stanza.</p>
      ) : (
        <div className="stanza">
          {stanza.map((line, i) => {
            const pinned = keeperTexts.has(line);
            return (
              <div className="stanza-line" key={i}>
                <span className="stanza-line-text">{line || '—'}</span>
                <button
                  type="button"
                  className={`pin-btn${pinned ? ' pinned' : ''}`}
                  onClick={() => line && onTogglePin(line)}
                  disabled={!line}
                  aria-label={pinned ? 'Unpin line' : 'Pin line to keepers'}
                  title={pinned ? 'Unpin from keepers' : 'Pin to keepers'}
                >
                  {pinned ? '★' : '☆'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
