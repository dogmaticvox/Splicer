let nextId = 1;

export function newSource(label = 'Source') {
  return { id: `src-${Date.now()}-${nextId++}`, label, text: '' };
}
