
import test from 'ava';
import { createDeleteUnpopularConceptsOptions } from './deleteUnpopularConcepts';

test('createDeleteUnpopularConceptsOptions', t => {
    t.is(createDeleteUnpopularConceptsOptions(1000).minConceptPopularity, 10);
    t.is(createDeleteUnpopularConceptsOptions(100).minConceptPopularity, 1);
});
