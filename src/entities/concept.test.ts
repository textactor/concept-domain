
import test from 'ava';
import { Concept } from './concept';

test('#hash', t => {
    const hash1 = Concept.hash('text 1', 'en', 'us');
    const hash2 = Concept.hash('text 2', 'en', 'us');
    t.not(hash1, hash2)
})

test('#normalizeName', t => {
    t.is(Concept.normalizeName('iPhone 5', 'en'), 'iphone 5');
    t.is(Concept.normalizeName('iPHone 5', 'en'), 'iphone 5');
    t.is(Concept.normalizeName('PLDM', 'ro'), 'PLDM');
    t.is(Concept.normalizeName('Chișinău', 'ro'), 'chișinău');
})

test('#create', t => {
    const c1 = Concept.create({ text: 'Moldova 1', lang: 'ro', country: 'md', abbr: 'M1' });
    t.is(c1.text, 'Moldova 1')
    t.is(c1.lang, 'ro')
    t.is(c1.country, 'md')
    t.is(c1.abbr, 'M1')
    t.is(c1.countWords, 2)
    t.is(c1.isAbbr, false)
    t.is(c1.isIrregular, false)
    t.is(c1.normalText, 'moldova 1')
    t.is(c1.rootText, 'Moldov 1')
})
