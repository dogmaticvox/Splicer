const STORAGE_KEY = 'splicer.sessions.v1';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function writeAll(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function listSessions() {
  return Object.values(readAll()).sort((a, b) => b.savedAt - a.savedAt);
}

export function saveSession(name, { sources, keepers, unit, grammarMode }) {
  const sessions = readAll();
  sessions[name] = { name, sources, keepers, unit, grammarMode, savedAt: Date.now() };
  writeAll(sessions);
}

export function loadSession(name) {
  return readAll()[name] || null;
}

export function deleteSession(name) {
  const sessions = readAll();
  delete sessions[name];
  writeAll(sessions);
}
