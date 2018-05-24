
import test from 'ava';
import { ActorHelper } from './actorHelper';
import { Locale, IKnownNameService } from '..';
import { getEntities } from 'wiki-entity';
import { WikiEntityBuilder } from '../interactors/actions/wikiEntityBuilder';


test('#buildNames', t => {
    const lang = 'ro';
    t.deepEqual(ActorHelper.buildNames(lang, []), [], 'Empty names');
    t.deepEqual(ActorHelper.buildNames(lang, null), [], 'Null empty names');
    t.deepEqual(ActorHelper.buildNames(lang, ['Name 1'], ['Long Name 1']), ['Long Name 1', 'Name 1'], 'Concat names');
});

test('#build', t => {
    const locale: Locale = { lang: 'ro', country: 'ro' };
    let names = ['Name 1', 'Name frst'];
    let actor = ActorHelper.build(locale, names);
    t.is(actor.name, 'Name 1');
    t.is(actor.country, locale.country);
    t.is(actor.lang, locale.lang);
    t.deepEqual(actor.names, names);
    t.is(actor.wikiEntity, undefined);
});

test('#build Valeriu Munteanu ro-md', async t => {
    const locale: Locale = { lang: 'ro', country: 'ro' };
    const title = 'Valeriu Munteanu (politician)';
    const webWikiEntity = (await getEntities({ language: locale.lang, titles: title, redirects: true, types: true }))[0];
    const builder = new WikiEntityBuilder(locale, new KnownNamesService());
    const wikiEntity = builder.build({ wikiEntity: webWikiEntity });
    t.is(wikiEntity.name, title, 'wiki entity name===title');
    t.is(wikiEntity.wikiPageTitle, title, 'wiki entity page title===title');
    const actor = ActorHelper.build(locale, ['Valeriu Munteanu'], wikiEntity);
    t.is(actor.name, title, 'actor name===title');
});

test('#validate', t => {
    t.throws(() => ActorHelper.validate(null), /null or undefined/);
    t.throws(() => ActorHelper.validate({ name: null, names: null, lang: null, country: null }), /invalid lang/);
    t.throws(() => ActorHelper.validate({ name: 'n', names: null, lang: 'ro', country: 'ro' }), /invalid name:/);
    t.throws(() => ActorHelper.validate({ name: 'name', names: null, lang: 'ro', country: 'ro' }), /no names/);
    t.throws(() => ActorHelper.validate({ name: 'name', names: ['n'], lang: 'ro', country: 'ro' }), /names contains invalid names/);
});


class KnownNamesService implements IKnownNameService {
    getKnownName(_name: string, _lang: string, _country: string): { name: string; countryCodes?: string[]; } {
        return null;
    }
}
