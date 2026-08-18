import nlp from 'compromise';

const TAGS = {
  nouns: '#Noun',
  verbs: '#Verb',
  adjectives: '#Adjective',
  adverbs: '#Adverb',
  determiners: '#Determiner',
  prepositions: '#Preposition',
  pronouns: '#Pronoun',
  conjunctions: '#Conjunction',
};

// Tags every source's real sentences with compromise (so context informs the
// tagging), then buckets the surface words by part of speech. Buckets are
// pooled across all sources, which is what lets "loosely grammatical" mode
// recombine words from unrelated subjects into one plausible line.
export function buildPosPools(sources) {
  const pools = Object.fromEntries(Object.keys(TAGS).map((k) => [k, new Set()]));
  for (const source of sources) {
    const doc = nlp(source.text || '');
    for (const [bucket, tag] of Object.entries(TAGS)) {
      for (const w of doc.match(tag).out('array')) {
        const clean = w.trim().toLowerCase();
        if (clean) pools[bucket].add(clean);
      }
    }
  }
  return Object.fromEntries(Object.entries(pools).map(([k, v]) => [k, [...v]]));
}

// Buckets comma-delimited phrases by rough grammatical shape, for phrase-unit
// grammatical shuffling: noun phrases (no verb), verb phrases (has a verb),
// and prepositional phrases (leads with a preposition).
export function classifyPhrases(phrases) {
  const buckets = { np: [], vp: [], pp: [], other: [] };
  for (const phrase of phrases) {
    const doc = nlp(phrase);
    if (doc.match('^#Preposition').found) buckets.pp.push(phrase);
    else if (doc.verbs().found) buckets.vp.push(phrase);
    else if (doc.nouns().found) buckets.np.push(phrase);
    else buckets.other.push(phrase);
  }
  return buckets;
}

// A sentence "reads as a clause" if compromise can find both a noun and a
// verb in it — used to bias grammatical-mode sentence splicing toward
// fragments that still make sense on their own.
export function looksLikeClause(text) {
  const doc = nlp(text);
  return doc.nouns().found && doc.verbs().found;
}
