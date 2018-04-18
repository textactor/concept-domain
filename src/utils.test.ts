
import test from 'ava';

import { getPartialName } from './utils';

test('getPartialName', t => {
    t.is(getPartialName('Ministerul Educatiei (Romaniei)', 'ro', 'ro'), 'Ministerul Educatiei');
    t.is(getPartialName('Ministerul Educatiei al Romaniei', 'ro', 'md'), null);
    t.is(getPartialName('Ministerul Educatiei al Moldovei', 'ro', 'md'), 'Ministerul Educatiei');
})
