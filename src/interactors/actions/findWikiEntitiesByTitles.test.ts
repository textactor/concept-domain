
import { FindWikiEntitiesByTitles } from './findWikiEntitiesByTitles';
import test from 'ava';
import { IKnownNameService } from '../knownNamesService';

test('ro-md', async t => {
    const finder = new FindWikiEntitiesByTitles({ lang: 'ro', country: 'md' }, new KnownNamesService());

    const ilanShorEntities = await finder.execute(['Ilan Șor']);
    t.is(ilanShorEntities.length, 1);
    t.is(ilanShorEntities[0].wikiPageTitle, 'Ilan Șor');
});

class KnownNamesService implements IKnownNameService {
    getKnownName(_name: string, _lang: string, _country: string): { name: string; countryCodes?: string[]; } {
        return null;
    }
}
