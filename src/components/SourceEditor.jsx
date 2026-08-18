import { newSource } from '../lib/source';

export default function SourceEditor({ sources, onChange }) {
  function updateSource(id, patch) {
    onChange(sources.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function addSource() {
    onChange([...sources, newSource(`Source ${sources.length + 1}`)]);
  }

  function removeSource(id) {
    onChange(sources.filter((s) => s.id !== id));
  }

  return (
    <section className="card">
      <h2 className="card-title">SOURCE TEXT</h2>
      <div className="source-list">
        {sources.map((source) => (
          <div className="source-item" key={source.id}>
            <div className="source-item-head">
              <input
                className="text-input source-label-input"
                value={source.label}
                onChange={(e) => updateSource(source.id, { label: e.target.value })}
                aria-label="Source label"
              />
              {sources.length > 1 && (
                <button
                  className="remove-btn"
                  onClick={() => removeSource(source.id)}
                  aria-label={`Remove ${source.label}`}
                  type="button"
                >
                  ×
                </button>
              )}
            </div>
            <textarea
              className="text-input"
              value={source.text}
              onChange={(e) => updateSource(source.id, { text: e.target.value })}
              placeholder="Paste or type lyrics, prose, headlines — anything."
            />
          </div>
        ))}
      </div>
      <button className="btn btn-outline" onClick={addSource} type="button">
        + ADD SOURCE
      </button>
    </section>
  );
}
