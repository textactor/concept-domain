
import test from 'ava';
import { ConceptHelper } from './conceptHelper';

test('#nameHash', t => {
    let hash1 = ConceptHelper.nameHash('text 1', 'en', 'us');
    let hash2 = ConceptHelper.nameHash('text 2', 'en', 'us');
    t.not(hash1, hash2)

    hash1 = ConceptHelper.nameHash('text 1', 'en', 'us');
    hash2 = ConceptHelper.nameHash('text 1', 'en', 'gb');
    t.not(hash1, hash2)

    hash1 = ConceptHelper.nameHash('text 1', 'en', 'us');
    hash2 = ConceptHelper.nameHash('text 1', 'en', 'us');
    t.is(hash1, hash2)
})

test('#normalizeName', t => {
    t.is(ConceptHelper.normalizeName('iPhone 5', 'en'), 'iphone 5');
    t.is(ConceptHelper.normalizeName('iPHone 5', 'en'), 'iphone 5');
    t.is(ConceptHelper.normalizeName('PLDM', 'ro'), 'PLDM');
    t.is(ConceptHelper.normalizeName('Chișinău', 'ro'), 'chișinău');
})

test('#create', t => {
    const c1 = ConceptHelper.create({ text: 'Moldova 1', lang: 'ro', country: 'md', abbr: 'M1' });
    t.is(c1.name, 'Moldova 1')
    t.is(c1.lang, 'ro')
    t.is(c1.country, 'md')
    t.is(c1.abbr, 'M1')
    t.is(c1.countWords, 2)
    t.is(c1.isAbbr, false)
    t.is(c1.isIrregular, false)
    t.is(c1.normalName, 'moldova 1')
    t.is(c1.rootName, 'Moldov 1')
})

test('#rootName', t => {
    t.is(ConceptHelper.rootName('iPhone 5', 'ro'), 'iPhone 5');
    t.is(ConceptHelper.rootName('Ana Balan', 'ro'), 'An Balan');
    t.is(ConceptHelper.rootName('Anei Balan', 'ro'), 'An Balan');
    t.is(ConceptHelper.rootName('PLDM', 'ro'), 'PLDM');
    t.is(ConceptHelper.rootName('Владимира Путина', 'ru'), 'Владимир Путин');
})

test('#setConceptsContextName', t => {
    const concepts = [
        { text: 'Moldova 1', lang: 'ro', country: 'md', abbr: 'M1' },
        { text: 'Comisia Electorala Centrala', lang: 'ro', country: 'md' },
        { text: 'CEC', lang: 'ro', country: 'md' },
    ].map(item => ConceptHelper.create(item));

    ConceptHelper.setConceptsContextName(concepts)

    t.is(concepts[0].contextName, undefined);
    t.is(concepts[1].contextName, 'CEC');
    t.is(concepts[2].contextName, undefined);
})
