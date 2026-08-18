// Splits raw source text into the three shuffle units the spec calls for:
// words, comma-delimited phrases, and sentences.

export function splitWords(text) {
  const matches = text.match(/[A-Za-z0-9''-]+/g) || [];
  return matches.map((w) => w.trim()).filter(Boolean);
}

// Comma-delimited, but also breaks on sentence-ending punctuation and
// semicolons. Without that, prose with few or no commas (plain sentences)
// collapses into one giant "phrase" — a pool that thin can only ever repeat
// itself. Splitting on sentence boundaries too keeps phrases finer-grained
// than sentences when commas are present, while still degrading gracefully
// to sentence-sized chunks when they aren't.
export function splitPhrases(text) {
  return text
    .split(/[,;.!?\n]+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const SPLITTERS = { word: splitWords, phrase: splitPhrases, sentence: splitSentences };

// Pools drawn from every source's text plus every keeper line (pinned lines'
// words "stay in the pool, reused freely" per the spec, so their tokens are
// mixed back in as extra source material).
export function buildPool(unit, sources, keepers) {
  const split = SPLITTERS[unit];
  const items = [];
  for (const source of sources) items.push(...split(source.text || ''));
  for (const keeper of keepers) items.push(...split(keeper.text || ''));
  return items;
}
