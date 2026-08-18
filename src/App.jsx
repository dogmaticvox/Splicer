import { useState } from 'react';
import Header from './components/Header';
import SourceEditor from './components/SourceEditor';
import { newSource } from './lib/source';
import ShuffleControls from './components/ShuffleControls';
import StanzaPanel from './components/StanzaPanel';
import KeepersPanel from './components/KeepersPanel';
import SessionBar from './components/SessionBar';
import { generateStanza, hasSourceText } from './lib/generator';
import {
  listSessions,
  saveSession as persistSession,
  loadSession as fetchSession,
  deleteSession as removeSession,
} from './lib/sessions';

function App() {
  const [sources, setSources] = useState([newSource('Source 1')]);
  const [unit, setUnit] = useState('word');
  const [grammarMode, setGrammarMode] = useState('random');
  const [stanza, setStanza] = useState([]);
  const [keepers, setKeepers] = useState([]);
  const [sessions, setSessions] = useState(() => listSessions());

  const keeperTexts = new Set(keepers.map((k) => k.text));

  function handleShuffle() {
    setStanza(generateStanza({ unit, grammarMode, sources, keepers }));
  }

  function togglePin(line) {
    const existing = keepers.find((k) => k.text === line);
    if (existing) {
      setKeepers(keepers.filter((k) => k.id !== existing.id));
    } else {
      setKeepers([...keepers, { id: `keep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text: line }]);
    }
  }

  function removeKeeper(id) {
    setKeepers(keepers.filter((k) => k.id !== id));
  }

  function saveSession(name) {
    persistSession(name, { sources, keepers, unit, grammarMode });
    setSessions(listSessions());
  }

  function loadSession(name) {
    const data = fetchSession(name);
    if (!data) return;
    setSources(data.sources);
    setKeepers(data.keepers);
    setUnit(data.unit);
    setGrammarMode(data.grammarMode);
    setStanza([]);
  }

  function deleteSession(name) {
    removeSession(name);
    setSessions(listSessions());
  }

  return (
    <>
      <div className="bg-grid" aria-hidden="true"></div>
      <Header />
      <main>
        <SourceEditor sources={sources} onChange={setSources} />
        <ShuffleControls
          unit={unit}
          onUnitChange={setUnit}
          grammarMode={grammarMode}
          onGrammarModeChange={setGrammarMode}
          onShuffle={handleShuffle}
          disabled={!hasSourceText(sources)}
        />
        <StanzaPanel stanza={stanza} keeperTexts={keeperTexts} onTogglePin={togglePin} />
        <KeepersPanel keepers={keepers} onRemove={removeKeeper} />
        <SessionBar sessions={sessions} onSave={saveSession} onLoad={loadSession} onDelete={deleteSession} />
      </main>
      <footer className="app-footer">runs 100% on your device · works offline</footer>
    </>
  );
}

export default App;
