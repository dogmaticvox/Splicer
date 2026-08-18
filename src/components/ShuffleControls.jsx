const UNITS = [
  { id: 'word', label: 'WORD' },
  { id: 'phrase', label: 'PHRASE' },
  { id: 'sentence', label: 'SENTENCE' },
];

export default function ShuffleControls({ unit, onUnitChange, grammarMode, onGrammarModeChange, onShuffle, disabled }) {
  const grammatical = grammarMode === 'grammatical';

  return (
    <section className="card">
      <h2 className="card-title">SHUFFLE</h2>

      <div className="segmented" role="radiogroup" aria-label="Shuffle unit">
        {UNITS.map((u) => (
          <button
            key={u.id}
            type="button"
            role="radio"
            aria-checked={unit === u.id}
            className={`segmented-btn${unit === u.id ? ' active' : ''}`}
            onClick={() => onUnitChange(u.id)}
          >
            {u.label}
          </button>
        ))}
      </div>

      <div className="control-row">
        <span className="switch-label">LOOSELY GRAMMATICAL</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={grammatical}
            onChange={(e) => onGrammarModeChange(e.target.checked ? 'grammatical' : 'random')}
          />
          <span className="switch-track" aria-hidden="true"></span>
        </label>
      </div>

      <button className="btn btn-primary" onClick={onShuffle} disabled={disabled} type="button">
        SHUFFLE
      </button>
    </section>
  );
}
