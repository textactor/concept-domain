
import test from 'ava';
import { WikiEntityHelper } from './wikiEntityHelper';
import { getEntities } from 'wiki-entity';
import { WikiEntityType } from './wikiEntity';

test('#nameHash', t => {
    let hash1 = WikiEntityHelper.nameHash('text 1', 'en');
    let hash2 = WikiEntityHelper.nameHash('text 2', 'en');
    t.not(hash1, hash2)

    hash1 = WikiEntityHelper.nameHash('text 1', 'en');
    hash2 = WikiEntityHelper.nameHash('text 1', 'en');
    t.is(hash1, hash2)
})

test('#splitName', t => {
    t.is(WikiEntityHelper.splitName('iPhone 5'), null);
    t.deepEqual(WikiEntityHelper.splitName('iPhone 5 (details)'), { simple: 'iPhone 5', special: 'details' });
})

test('#convert', async t => {

    const lang = 'en';

    const wikiEntity = (await getEntities({ titles: 'Central Intelligence Agency', language: lang, claims: 'item', extract: 3, types: true, redirects: true }))[0];

    t.not(wikiEntity, null);

    const entity = WikiEntityHelper.convert(wikiEntity, lang);

    t.is(entity.name, wikiEntity.label)
    t.is(entity.type, WikiEntityType.ORG)
    t.is(entity.countryCode, 'us')
    t.is(entity.abbr, 'CIA')
    t.is(entity.wikiDataId, 'Q37230')
})

test('#isDisambiguation', async t => {
    const wikiEntity = (await getEntities({ titles: 'Adrian Ursu', language: 'ro', claims: 'item', extract: 3, types: true, redirects: true }))[0];

    const entity = WikiEntityHelper.convert(wikiEntity, 'ro');

    t.is(WikiEntityHelper.isDisambiguation(entity), true);
})

test('#getLastname', t => {
    t.is(WikiEntityHelper.getLastname(null), undefined);
    t.is(WikiEntityHelper.getLastname('Bauer'), undefined);
    t.is(WikiEntityHelper.getLastname('Kim Bauer'), 'Bauer');
})

test('lastname', async t => {

    const lang = 'en';

    const wikiEntity = (await getEntities({ ids: 'Q1049347', language: lang, claims: 'item', extract: 3, types: true, redirects: true }))[0];

    t.not(wikiEntity, null);

    const entity = WikiEntityHelper.convert(wikiEntity, lang);

    t.is(entity.name, wikiEntity.label)
    t.is(entity.type, WikiEntityType.PERSON)
    t.is(entity.countryCode, 'us')
    t.is(entity.lastname, 'Bauer')
})
