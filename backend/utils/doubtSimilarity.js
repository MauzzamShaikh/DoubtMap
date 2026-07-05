const COMMAND_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'can',
  'could',
  'describe',
  'did',
  'discuss',
  'do',
  'does',
  'doubt',
  'for',
  'from',
  'give',
  'help',
  'how',
  'in',
  'is',
  'list',
  'mam',
  'maam',
  'madam',
  'me',
  'miss',
  'of',
  'please',
  'show',
  'sir',
  'state',
  'step',
  'steps',
  'tell',
  'the',
  'this',
  'to',
  'what',
  'why',
  'you'
]);

const INTENT_KEYWORDS = {
  conversion: new Set(['convert', 'conversion', 'converting']),
  types: new Set(['type', 'types', 'kind', 'kinds', 'category', 'categories']),
  difference: new Set(['difference', 'different', 'differentiate', 'between', 'compare', 'comparison', 'versus', 'vs']),
  properties: new Set(['property', 'properties', 'characteristic', 'characteristics', 'feature', 'features']),
  examples: new Set(['example', 'examples', 'sample', 'samples', 'illustration']),
  syntax: new Set(['syntax', 'query', 'command', 'write', 'code']),
  useCase: new Set(['use', 'uses', 'usage', 'application', 'applications', 'when', 'where']),
  advantages: new Set(['advantage', 'advantages', 'benefit', 'benefits']),
  disadvantages: new Set(['disadvantage', 'disadvantages', 'limitation', 'limitations']),
  definition: new Set(['define', 'definition', 'explain', 'explanation', 'mean', 'meaning', 'means', 'overview', 'short'])
};

const INTENT_WORDS = new Set(Object.values(INTENT_KEYWORDS).flatMap((keywords) => [...keywords]));
const DIRECTION_MARKERS = new Set(['to', 'into']);
const INTENT_CONTEXT_WORDS = {
  syntax: new Set(['program', 'sql', 'statement'])
};

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeWord(word) {
  if (['conversion', 'converting', 'converted'].includes(word)) return 'convert';
  if (['categories'].includes(word)) return 'category';
  if (word.endsWith('ies') && word.length > 4) return `${word.slice(0, -3)}y`;
  if (word.endsWith('ing') && word.length > 5) return word.slice(0, -3);
  if (word.endsWith('ed') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('s') && word.length > 3) return word.slice(0, -1);
  return word;
}

function getWords(text) {
  return normalizeText(text).split(' ').filter(Boolean);
}

function getIntent(words) {
  const normalizedWords = words.map(normalizeWord);

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (normalizedWords.some((word) => keywords.has(word))) {
      return intent;
    }
  }

  return 'definition';
}

function getConceptWords(text, intent) {
  const contextWords = INTENT_CONTEXT_WORDS[intent] || new Set();
  const words = getWords(text)
    .filter((word) => !COMMAND_WORDS.has(word))
    .map(normalizeWord)
    .filter((word) =>
      word.length > 1 &&
      !COMMAND_WORDS.has(word) &&
      !INTENT_WORDS.has(word) &&
      !contextWords.has(word)
    );

  return [...new Set(words)];
}

function getConversionDirection(words) {
  const normalizedWords = words.map(normalizeWord);
  let markerIndex = -1;

  normalizedWords.forEach((word, index) => {
    if (DIRECTION_MARKERS.has(word)) {
      markerIndex = index;
    }
  });

  if (markerIndex <= 0 || markerIndex >= normalizedWords.length - 1) {
    return null;
  }

  const ignored = new Set([...COMMAND_WORDS, ...INTENT_WORDS]);
  const from = [...normalizedWords]
    .slice(0, markerIndex)
    .reverse()
    .find((word) => word.length > 1 && !ignored.has(word));
  const to = normalizedWords
    .slice(markerIndex + 1)
    .find((word) => word.length > 1 && !ignored.has(word));

  if (!from || !to) return null;

  return { from, to };
}

function getDoubtSignature(text) {
  const words = getWords(text);
  const intent = getIntent(words);

  return {
    normalizedText: normalizeText(text),
    intent,
    conceptWords: getConceptWords(text, intent),
    conversionDirection: getConversionDirection(words)
  };
}

function getSimilarityScore(a, b) {
  const signatureA = getDoubtSignature(a);
  const signatureB = getDoubtSignature(b);

  if (!signatureA.normalizedText || !signatureB.normalizedText) return 0;
  if (signatureA.normalizedText === signatureB.normalizedText) return 1;
  if (signatureA.intent !== signatureB.intent) return 0;

  const wordsA = signatureA.conceptWords;
  const wordsB = signatureB.conceptWords;
  if (!wordsA.length || !wordsB.length) return 0;

  if (signatureA.intent === 'conversion') {
    const directionA = signatureA.conversionDirection;
    const directionB = signatureB.conversionDirection;

    if (!directionA || !directionB) return 0;

    return directionA.from === directionB.from && directionA.to === directionB.to ? 1 : 0;
  }

  const conceptA = wordsA.join(' ');
  const conceptB = wordsB.join(' ');
  if (conceptA === conceptB) return 1;

  const setB = new Set(wordsB);
  const intersection = wordsA.filter((word) => setB.has(word)).length;

  return (2 * intersection) / (wordsA.length + wordsB.length);
}

function isDuplicateDoubt(existingText, incomingText) {
  return getSimilarityScore(existingText, incomingText) >= 0.9;
}

module.exports = {
  getDoubtSignature,
  getSimilarityScore,
  isDuplicateDoubt
};
