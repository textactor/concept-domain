
import { FindWikiEntitiesByTitles } from './findWikiEntitiesByTitles';
import test from 'ava';

test('ro-md', async t => {
    const finder = new FindWikiEntitiesByTitles({ lang: 'ro', country: 'md' });

    const ilanShorEntities = await finder.execute(['Ilan Șor']);
    t.is(ilanShorEntities.length, 1);
    t.is(ilanShorEntities[0].wikiPageTitle, 'Ilan Șor');
});
