
import test from 'ava';
import { ActorHelper } from './actorHelper';

test('#getLastname', t => {
    t.is(ActorHelper.getLastname(null), undefined);
    t.is(ActorHelper.getLastname({}), undefined);
    t.is(ActorHelper.getLastname({ P734: [] }), undefined);
    t.is(ActorHelper.getLastname({ P734: ['Bauer'] }), 'Bauer');
    t.is(ActorHelper.getLastname({ P734: ['Bauer'] }, 'Kim Bauer'), 'Bauer');
    t.is(ActorHelper.getLastname({ P735: ['Kim'] }, 'Kim Bauer'), 'Bauer');
    t.is(ActorHelper.getLastname({ P735: ['Kim'] }), undefined);
})
