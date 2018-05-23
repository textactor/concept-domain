
import test from 'ava';

import { getPartialName } from './utils';

test('getPartialName', t => {
    t.is(getPartialName('Ministerul Educatiei (Romaniei)', 'ro', 'ro'), 'Ministerul Educatiei', '(Romaniei)');
    t.is(getPartialName('Ministerul Educatiei al Romaniei', 'ro', 'ro', ['ro']), 'Ministerul Educatiei', 'al Romaniei');
    t.is(getPartialName('Ministerul Educatiei al Moldovei', 'ro', 'ro', ['md']), null, 'ro-md: al Moldovei');
    t.is(getPartialName('Ministerul Educatiei al Moldovei', 'ro', 'ro', ['ro']), 'Ministerul Educatiei', 'ro-ro: al Moldovei');
})
