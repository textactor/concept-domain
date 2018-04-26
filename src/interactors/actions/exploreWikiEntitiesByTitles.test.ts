
import { ExploreWikiEntitiesByTitles } from './exploreWikiEntitiesByTitles';
import test from 'ava';

test('ro-md', async t => {
    const finder = new ExploreWikiEntitiesByTitles({ lang: 'ro', country: 'md' });

    const ilanShorEntities = await finder.execute(['Ilan Șor']);
    t.is(ilanShorEntities.length, 1);
    t.is(ilanShorEntities[0].wikiPageTitle, 'Ilan Șor');
});
