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

function capitalize(line) {
  return line ? line[0].toUpperCase() + line.slice(1) : line;
}

function fillTemplate(shape, pools, fallback) {
  return shape
    .map((bucket) => pick(pools[bucket]?.length ? pools[bucket] : fallback))
    .filter(Boolean)
    .join(' ');
}

function randomWordLine(words) {
  const count = 3 + Math.floor(Math.random() * 6); // 3–8 words
  const line = Array.from({ length: count }, () => pick(words)).join(' ');
  return capitalize(line);
}

function grammaticalWordLine(pools, fallback) {
  const shape = pick(GRAMMAR_TEMPLATES);
  return capitalize(fillTemplate(shape, pools, fallback));
}

function randomPhraseLine(phrases) {
  const count = 1 + Math.floor(Math.random() * 3); // 1–3 phrases
  const line = Array.from({ length: count }, () => pick(phrases)).join(', ');
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
  const line = shape
    .map((bucket) => pick(buckets[bucket]?.length ? buckets[bucket] : fallback))
    .filter(Boolean)
    .join(', ');
  return capitalize(line);
}

function randomSentenceLine(sentences) {
  let line = pick(sentences);
  if (sentences.length > 1 && Math.random() < 0.3) {
    let other = pick(sentences);
    if (other === line) other = pick(sentences);
    line = `${line.replace(/[.!?]+$/, '')}, ${pick(SPLICE_CONJUNCTIONS)} ${other[0].toLowerCase() + other.slice(1)}`;
  }
  return capitalize(line);
}

function grammaticalSentenceLine(sentences) {
  const clauses = sentences.filter(looksLikeClause);
  const pool = clauses.length ? clauses : sentences;
  let line = pick(pool);
  if (pool.length > 1 && Math.random() < 0.3) {
    let other = pick(pool);
    if (other === line) other = pick(pool);
    line = `${line.replace(/[.!?]+$/, '')}, ${pick(SPLICE_CONJUNCTIONS)} ${other[0].toLowerCase() + other.slice(1)}`;
  }
  return capitalize(line);
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
