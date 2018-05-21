
import test from 'ava';
import { ActorHelper } from './actorHelper';
import { Locale } from '..';


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

test('#validate', t => {
    t.throws(() => ActorHelper.validate(null), /null or undefined/);
    t.throws(() => ActorHelper.validate({ name: null, names: null, lang: null, country: null }), /invalid lang/);
    t.throws(() => ActorHelper.validate({ name: 'n', names: null, lang: 'ro', country: 'ro' }), /invalid name:/);
    t.throws(() => ActorHelper.validate({ name: 'name', names: null, lang: 'ro', country: 'ro' }), /no names/);
    t.throws(() => ActorHelper.validate({ name: 'name', names: ['n'], lang: 'ro', country: 'ro' }), /names contains invalid names/);
});
