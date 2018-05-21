
import test from 'ava';
import { WikiEntityHelper } from './wikiEntityHelper';
import { getEntities } from 'wiki-entity';
import { WikiEntityType } from './wikiEntity';
import { NameHelper } from '@textactor/domain';

test('#nameHash', t => {
    let hash1 = WikiEntityHelper.nameHash('text 1', 'en');
    let hash2 = WikiEntityHelper.nameHash('text 2', 'en');
    t.not(hash1, hash2)

    hash1 = WikiEntityHelper.nameHash('text 1', 'en');
    hash2 = WikiEntityHelper.nameHash('text 1', 'en');

    t.is(hash1, hash2)

    const usHash = WikiEntityHelper.nameHash('Statele Unite', 'ro');
    t.is(usHash, '0848168a5a32634a5d6e102b81682821');
})

test('#splitName', t => {
    t.is(WikiEntityHelper.splitName('iPhone 5'), null);
    t.deepEqual(WikiEntityHelper.splitName('iPhone 5 (details)'), { simple: 'iPhone 5', special: 'details' });
})

test('#convert CIA', async t => {

    const lang = 'en';

    const wikiEntity = (await getEntities({ titles: 'Central Intelligence Agency', language: lang, claims: 'item', extract: 3, types: true, redirects: true }))[0];

    t.not(wikiEntity, null);

    const entity = WikiEntityHelper.convert(wikiEntity, lang, lang);

    t.is(entity.name, wikiEntity.label)
    t.is(entity.type, WikiEntityType.ORG)
    t.is(entity.countryCodes.indexOf('us') > -1, true)
    t.is(entity.abbr, 'CIA')
    t.is(entity.wikiDataId, 'Q37230')
})

test('#convert (using wiki title as name)', async t => {

    const lang = 'ro';

    const wikiEntity = (await getEntities({ ids: 'Q178861', language: lang, claims: 'item', extract: 3, types: true, redirects: true }))[0];

    t.not(wikiEntity, null);

    const entity = WikiEntityHelper.convert(wikiEntity, lang, lang);

    t.is(entity.name, entity.wikiPageTitle)
    t.is(entity.type, WikiEntityType.PLACE)
    t.is(entity.countryCodes.indexOf('ro') > -1, true)
    t.is(entity.wikiDataId, 'Q178861')
    t.is(entity.names.find(item => NameHelper.countWords(item) === 1), undefined);
})

test('#convert (Adrian Ursu)', async t => {

    const lang = 'ro';

    const wikiEntity = (await getEntities({ ids: 'Q18548924', language: lang, claims: 'item', extract: 3, types: true, redirects: true }))[0];

    t.not(wikiEntity, null);

    const entity = WikiEntityHelper.convert(wikiEntity, lang, lang);

    t.is(entity.name, wikiEntity.label)
    t.is(entity.name, 'Adrian Ursu');
    t.not(entity.name, entity.wikiPageTitle);
    t.is(entity.type, WikiEntityType.PERSON)
    t.is(entity.countryCodes.indexOf('md') > -1, true)
    t.is(entity.wikiDataId, 'Q18548924')
    t.is(entity.partialNames, undefined);
})

test('#convert (partial names)', async t => {

    const lang = 'ro';

    const wikiEntity = (await getEntities({ ids: 'Q4294406', language: lang, claims: 'item', extract: 3, types: true, redirects: true }))[0];

    t.not(wikiEntity, null);

    const entity = WikiEntityHelper.convert(wikiEntity, lang, lang);

    t.is(entity.name, wikiEntity.label)
    t.is(entity.type, WikiEntityType.ORG)
    t.is(entity.countryCodes.indexOf('md') > -1, true)
    t.is(entity.wikiDataId, 'Q4294406')
    t.true(entity.partialNames.length > 0);
})

test('#isDisambiguation', async t => {
    const wikiEntity = (await getEntities({ titles: 'Adrian Ursu', language: 'ro', claims: 'item', extract: 3, types: true, redirects: true }))[0];

    const entity = WikiEntityHelper.convert(wikiEntity, 'ro', 'ro');

    t.is(WikiEntityHelper.isDisambiguation(entity), true);
})

test('#getLastname', t => {
    t.is(WikiEntityHelper.getLastname(null), undefined);
    t.is(WikiEntityHelper.getLastname('Bauer'), undefined);
    t.is(WikiEntityHelper.getLastname('Kim Bauer'), 'Bauer');
})
