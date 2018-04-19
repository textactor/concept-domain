
import test from 'ava';

import { getPartialName } from './utils';

test('getPartialName', t => {
    t.is(getPartialName('Ministerul Educatiei (Romaniei)', 'ro'), 'Ministerul Educatiei');
    t.is(getPartialName('Ministerul Educatiei al Romaniei', 'ro'), 'Ministerul Educatiei');
    t.is(getPartialName('Ministerul Educatiei al Moldovei', 'ro'), 'Ministerul Educatiei');
})
