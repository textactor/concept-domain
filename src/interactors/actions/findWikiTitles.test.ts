
import { FindWikiTitles } from './findWikiTitles';
import test from 'ava';

test('ro-md', async t => {
    const finder = new FindWikiTitles({ lang: 'ro', country: 'md' });

    const ilanShorTitles = await finder.execute(['Ilan Șor']);

    t.is(ilanShorTitles.length, 1);
    t.is(ilanShorTitles[0], 'Ilan Șor');
});
