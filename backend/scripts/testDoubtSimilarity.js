const assert = require('assert');
const { getDoubtSignature, isDuplicateDoubt } = require('../utils/doubtSimilarity');

const duplicateCases = [
  ['What does full outer join means', 'mam can you explain full outer join'],
  ['What does full outer join means', 'What is full outer join'],
  ['What is nfa', 'mam what is nfa'],
  ['Properties of nfa', 'state the properties of nfa'],
  ['properties of inner joins', 'properties of inner join'],
  ['conversion of dfa to nfa', 'conversion between dfa to nfa'],
  ['conversion of dfa to nfa', 'How to convert dfa to nfa'],
  ['how to convert nfa to dfa', 'conversion of nfa to dfa'],
  ['different types of joins?', 'types of joins'],
  ['difference between inner joins and outer joins', 'compare inner join and outer join'],
  ['example of full outer join', 'give examples of full outer joins'],
  ['advantages of dbms', 'benefits of dbms'],
  ['sql query for inner join', 'write syntax for inner join']
];

const distinctCases = [
  ['mam what is inner join', 'properties of inner joins'],
  ['inner joins', 'properties of inner joins'],
  ['Properties of nfa', 'Properties of dfa'],
  ['What is nfa', 'Mam what is dfa'],
  ['conversion of dfa to nfa', 'how to convert nfa to dfa'],
  ['How to convert dfa to nfa', 'how to convert nfa to dfa'],
  ['convert dfa nfa', 'convert nfa dfa'],
  ['explain outer join', 'What does full outer join means'],
  ['different types of joins?', 'difference between inner joins and outer joins'],
  ['Properties of full outer joins', 'properties of inner joins'],
  ['what is normalization', 'types of normalization'],
  ['advantages of dbms', 'disadvantages of dbms'],
  ['example of inner join', 'syntax of inner join'],
  ['what is dfa', 'how to convert dfa to nfa']
];

function formatSignature(text) {
  return JSON.stringify(getDoubtSignature(text));
}

for (const [existing, incoming] of duplicateCases) {
  assert.strictEqual(
    isDuplicateDoubt(existing, incoming),
    true,
    `Expected duplicate:\nexisting: ${existing}\nincoming: ${incoming}\n${formatSignature(existing)}\n${formatSignature(incoming)}`
  );
}

for (const [existing, incoming] of distinctCases) {
  assert.strictEqual(
    isDuplicateDoubt(existing, incoming),
    false,
    `Expected distinct:\nexisting: ${existing}\nincoming: ${incoming}\n${formatSignature(existing)}\n${formatSignature(incoming)}`
  );
}

console.log(`Doubt similarity tests passed (${duplicateCases.length + distinctCases.length} cases).`);
