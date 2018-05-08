
import test from 'ava';
import { MemoryConceptRepository } from '../memoryConceptRepository';
import { MemoryWikiEntityRepository } from '../memoryWikiEntityRepository';
import { Locale } from '../../types';
import { ExploreWikiEntities } from './exploreWikiEntities';
import { ConceptHelper } from '../../entities/conceptHelper';
import { PushContextConcepts } from './pushContextConcepts';
import { MemoryWikiSearchNameRepository } from '../memoryWikiSearchNameRepository';
import { MemoryWikiTitleRepository } from '../memoryWikiTitleRepository';
import { MemoryRootNameRepository } from '../memoryRootNameRepository';
import { ICountryTagsService } from './findWikiTitles';

test('ro-md', async t => {
    const conceptRepository = new MemoryConceptRepository();
    const wikiEntityRepository = new MemoryWikiEntityRepository();
    const wikiSearchNameRepository = new MemoryWikiSearchNameRepository();
    const wikiTitleRepository = new MemoryWikiTitleRepository();
    const rootNameRep = new MemoryRootNameRepository();
    const pushConcepts = new PushContextConcepts(conceptRepository, rootNameRep);
    const locale: Locale = { lang: 'ro', country: 'md' };
    const exploreWikiEntities = new ExploreWikiEntities(locale,
        conceptRepository,
        rootNameRep,
        wikiEntityRepository,
        wikiSearchNameRepository,
        wikiTitleRepository,
        new CountryTags());

    const conceptTexts: string[] = ['R. Moldova', 'Chișinău', 'Chisinau', 'Republica Moldova', 'Moldova', 'Chisinau'];

    const concepts = conceptTexts
        .map(name => ConceptHelper.create({ name, ...locale }));

    await pushConcepts.execute(concepts);

    t.is(await wikiEntityRepository.count(), 0, 'no wiki entities in DB');

    await exploreWikiEntities.execute(null);

    let countEntities = await wikiEntityRepository.count();

    t.log(`count entities=${countEntities}`);

    t.true(countEntities > 0, 'many wiki entities in DB');
});

class CountryTags implements ICountryTagsService {
    getTags(country: string, lang: string): string[] {

        const LOCALE_COUNTRY_TAGS: { [country: string]: { [lang: string]: string[] } } = {
            md: {
                ro: ['republica moldova', 'moldova'],
            },
            ro: {
                ro: ['românia', 'româniei'],
            },
            ru: {
                ru: ['Россия', 'РФ', 'России', 'Российской'],
            },
        }

        if (LOCALE_COUNTRY_TAGS[country]) {
            return LOCALE_COUNTRY_TAGS[country][lang];
        }
    }
}
