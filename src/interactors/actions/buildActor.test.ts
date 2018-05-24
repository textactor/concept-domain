
import { BuildActor } from './buildActor';
import test from 'ava';
import { ExploreWikiEntities } from './exploreWikiEntities';
import { ConceptContainer } from '../../entities/conceptContainer';
import { PopularConceptNamesEnumerator } from '../popularConceptNamesEnumerator';
import { Locale } from '../../types';
import { MemoryWikiEntityRepository } from '../memoryWikiEntityRepository';
import { MemoryConceptRepository } from '../memoryConceptRepository';
import { MemoryRootNameRepository } from '../memoryRootNameRepository';
import { PushContextConcepts } from './pushContextConcepts';
import { ConceptHelper } from '../../entities/conceptHelper';
import { MemoryWikiTitleRepository } from '../memoryWikiTitleRepository';
import { MemoryWikiSearchNameRepository } from '../memoryWikiSearchNameRepository';
import { WikiEntityHelper } from '../../entities/wikiEntityHelper';
import { ICountryTagsService } from './findWikiTitles';
import { IKnownNameService } from '../knownNamesService';

test('ro-md: partial name: Biblioteca Națională', async t => {
    const locale: Locale = { lang: 'ro', country: 'md' };

    const entityRep = new MemoryWikiEntityRepository();
    const conceptRep = new MemoryConceptRepository();
    const rootConceptRep = new MemoryRootNameRepository();
    const pushConcepts = new PushContextConcepts(conceptRep, rootConceptRep);
    const container: ConceptContainer = { id: '1', ...locale };
    const popularNamesEnumerator = new PopularConceptNamesEnumerator({ rootNames: true }, container, conceptRep, rootConceptRep);

    const bibliotecaNationala = ConceptHelper.build({ lang: locale.lang, country: locale.country, name: 'Biblioteca Națională', containerId: container.id });

    await pushConcepts.execute([bibliotecaNationala]);

    const exploreEntities = new ExploreWikiEntities(container, popularNamesEnumerator, entityRep,
        new MemoryWikiSearchNameRepository(), new MemoryWikiTitleRepository(), new CountryTags(), new KnownNamesService());

    await exploreEntities.execute(null);

    const exploredEntities = await entityRep
        .getByNameHash(WikiEntityHelper.nameHash('Biblioteca Națională a Republicii Moldova', locale.lang));

    t.is(exploredEntities.length, 1, 'Explored `Biblioteca Națională a Republicii Moldova`');

    const buildActor = new BuildActor(container, entityRep, conceptRep);

    const actor = await buildActor.execute(bibliotecaNationala.rootNameIds[0]);

    t.is(!!actor, true, 'Actor exists');

    t.is(actor.name, 'Biblioteca Națională a Republicii Moldova');
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

class KnownNamesService implements IKnownNameService {
    getKnownName(_name: string, _lang: string, _country: string): { name: string; countryCodes?: string[]; } {
        return null;
    }
}
