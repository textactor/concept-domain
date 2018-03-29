
import test from 'ava';
import { ConceptHelper } from './conceptHelper';
import { NameHelper } from '@textactor/domain';

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
    t.is(NameHelper.normalizeName('iPhone 5', 'en'), 'iphone 5');
    t.is(NameHelper.normalizeName('iPHone 5', 'en'), 'iphone 5');
    t.is(NameHelper.normalizeName('PLDM', 'ro'), 'PLDM');
    t.is(NameHelper.normalizeName('Chișinău', 'ro'), 'chișinău');
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
    t.is(ConceptHelper.rootName('iPhone 5', 'ro'), 'iPhon 5');
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

    ConceptHelper.setConceptsContextNames(concepts)

    t.is(concepts[0].contextNames, undefined);
    t.deepEqual(concepts[1].contextNames, ['CEC']);
    t.deepEqual(concepts[2].contextNames, ['Comisia Electorala Centrala']);
})
