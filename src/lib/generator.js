import { splitWords, splitPhrases, splitSentences, buildPool } from './tokenize';
import { buildPosPools, classifyPhrases, looksLikeClause } from './pos';

const STANZA_LENGTH = 6;
const SPLICE_CONJUNCTIONS = ['and', 'but', 'or', 'while', 'because', 'so', 'yet'];

// Word-level sentence shapes for "loosely grammatical" mode. Each slot names
// a bucket from buildPosPools(); unfilled buckets fall back to the full word
// pool so a shape never breaks just because a source is thin on, say, adverbs.
const GRAMMAR_TEMPLATES = [
  ['determiners', 'adjectives', 'nouns', 'verbs', 'prepositions', 'determiners', 'nouns'],
  ['nouns', 'verbs', 'adverbs'],
  ['pronouns', 'verbs', 'adjectives', 'nouns'],
  ['adjectives', 'nouns', 'verbs', 'determiners', 'nouns'],
  ['verbs', 'determiners', 'nouns', 'conjunctions', 'verbs', 'determiners', 'nouns'],
  ['determiners', 'nouns', 'verbs', 'adverbs', 'prepositions', 'nouns'],
  ['adverbs', 'pronouns', 'verbs', 'prepositions', 'determiners', 'adjectives', 'nouns'],
];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Picks from `list`, retrying a few times to avoid immediately repeating
// `prev` under `normalize` (case-insensitively by default) — this is what
// keeps cut-up lines from stuttering ("the the", "that that"), and stops
// sentence splicing from joining a fragment to a near-copy of itself. Falls
// back to a repeat if the pool genuinely has nothing else to offer.
function pickAvoiding(list, prev, normalize = (s) => s.toLowerCase()) {
  if (!list.length) return undefined;
  let choice = pick(list);
  let attempts = 0;
  while (prev && normalize(choice) === normalize(prev) && attempts < 8) {
    choice = pick(list);
    attempts++;
  }
  return choice;
}

// Sentences are compared with trailing punctuation stripped, so "It rained."
// and "It rained" — or two sentences differing only in a final "." vs "!" —
// still count as the same fragment for splicing purposes.
const normalizeSentence = (s) => s.trim().toLowerCase().replace(/[.!?]+$/, '');

function capitalize(line) {
  return line ? line[0].toUpperCase() + line.slice(1) : line;
}

function joinAvoidingRepeats(picks, separator) {
  const chosen = [];
  let prev = null;
  for (const list of picks) {
    const word = pickAvoiding(list, prev);
    if (!word) continue;
    chosen.push(word);
    prev = word;
  }
  return chosen.join(separator);
}

// When a slot's own POS bucket is empty, it falls back to a shared pool —
// but if another slot in the same shape has a *singleton* bucket (exactly
// one word/phrase), that word has no alternative: whichever slot is filled
// first can "steal" it from the shared fallback pool, forcing the singleton
// slot to repeat it right next to itself. Excluding singleton-bucket items
// from other slots' fallback closes that gap. Non-singleton buckets are
// left alone — pickAvoiding's retries already handle those statistically,
// and excluding everything reserved would just empty the fallback in a
// thin, heavily-bucketed pool.
function fallbackExcludingReserved(shape, bucketsOf, fallback) {
  const singletons = new Set(
    shape.flatMap((bucket) => (bucketsOf[bucket]?.length === 1 ? bucketsOf[bucket] : []))
  );
  if (!singletons.size) return fallback;
  const filtered = fallback.filter((item) => !singletons.has(item));
  return filtered.length ? filtered : fallback;
}

function fillTemplate(shape, pools, fallback) {
  const openFallback = fallbackExcludingReserved(shape, pools, fallback);
  const lists = shape.map((bucket) => (pools[bucket]?.length ? pools[bucket] : openFallback));
  return joinAvoidingRepeats(lists, ' ');
}

function randomWordLine(words) {
  const count = 3 + Math.floor(Math.random() * 6); // 3–8 words
  const line = joinAvoidingRepeats(Array.from({ length: count }, () => words), ' ');
  return capitalize(line);
}

function grammaticalWordLine(pools, fallback) {
  const shape = pick(GRAMMAR_TEMPLATES);
  return capitalize(fillTemplate(shape, pools, fallback));
}

function randomPhraseLine(phrases) {
  const count = 1 + Math.floor(Math.random() * 3); // 1–3 phrases
  const line = joinAvoidingRepeats(Array.from({ length: count }, () => phrases), ', ');
  return capitalize(line);
}

function grammaticalPhraseLine(buckets, fallback) {
  const shapes = [
    ['np', 'vp'],
    ['vp', 'np'],
    ['np', 'pp', 'vp'],
    ['vp', 'pp'],
  ];
  const shape = pick(shapes);
  const openFallback = fallbackExcludingReserved(shape, buckets, fallback);
  const lists = shape.map((bucket) => (buckets[bucket]?.length ? buckets[bucket] : openFallback));
  return capitalize(joinAvoidingRepeats(lists, ', '));
}

function spliceSentence(line, pool) {
  if (pool.length <= 1 || Math.random() >= 0.3) return capitalize(line);
  const other = pickAvoiding(pool, line, normalizeSentence);
  if (normalizeSentence(other) === normalizeSentence(line)) return capitalize(line);
  return capitalize(`${line.replace(/[.!?]+$/, '')}, ${pick(SPLICE_CONJUNCTIONS)} ${other[0].toLowerCase() + other.slice(1)}`);
}

function randomSentenceLine(sentences) {
  return spliceSentence(pick(sentences), sentences);
}

function grammaticalSentenceLine(sentences) {
  const clauses = sentences.filter(looksLikeClause);
  const pool = clauses.length ? clauses : sentences;
  return spliceSentence(pick(pool), pool);
}

function generateLine({ unit, grammarMode, sources, keepers }) {
  const grammatical = grammarMode === 'grammatical';

  if (unit === 'word') {
    const words = buildPool('word', sources, keepers);
    if (!words.length) return '';
    if (!grammatical) return randomWordLine(words);
    const allText = [...sources, ...keepers];
    const pools = buildPosPools(allText);
    return grammaticalWordLine(pools, words);
  }

  if (unit === 'phrase') {
    const phrases = buildPool('phrase', sources, keepers);
    if (!phrases.length) return '';
    if (!grammatical) return randomPhraseLine(phrases);
    return grammaticalPhraseLine(classifyPhrases(phrases), phrases);
  }

  // sentence
  const sentences = buildPool('sentence', sources, keepers);
  if (!sentences.length) return '';
  return grammatical ? grammaticalSentenceLine(sentences) : randomSentenceLine(sentences);
}

export function generateStanza({ unit, grammarMode, sources, keepers }) {
  const lines = [];
  for (let i = 0; i < STANZA_LENGTH; i++) {
    let line = generateLine({ unit, grammarMode, sources, keepers });
    let attempts = 0;
    while (line && lines.includes(line) && attempts < 4) {
      line = generateLine({ unit, grammarMode, sources, keepers });
      attempts++;
    }
    lines.push(line);
  }
  return lines;
}

export function hasSourceText(sources) {
  return sources.some((s) => splitWords(s.text || '').length > 0);
}

export { splitWords, splitPhrases, splitSentences };
