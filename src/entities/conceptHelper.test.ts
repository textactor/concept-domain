
import test from 'ava';
import { ConceptHelper } from './conceptHelper';

test('#hash', t => {
    const hash1 = ConceptHelper.hash('text 1', 'en', 'us');
    const hash2 = ConceptHelper.hash('text 2', 'en', 'us');
    t.not(hash1, hash2)
})

test('#normalizeName', t => {
    t.is(ConceptHelper.normalizeName('iPhone 5', 'en'), 'iphone 5');
    t.is(ConceptHelper.normalizeName('iPHone 5', 'en'), 'iphone 5');
    t.is(ConceptHelper.normalizeName('PLDM', 'ro'), 'PLDM');
    t.is(ConceptHelper.normalizeName('Chișinău', 'ro'), 'chișinău');
})

test('#create', t => {
    const c1 = ConceptHelper.create({ text: 'Moldova 1', lang: 'ro', country: 'md', abbr: 'M1' });
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
