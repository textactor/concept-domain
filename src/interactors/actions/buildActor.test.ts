
import { BuildActor } from './buildActor';
import test from 'ava';
import { Locale, MemoryWikiEntityRepository, MemoryConceptRepository, PushContextConcepts, MemoryRootNameRepository, ConceptHelper, MemoryWikiSearchNameRepository, MemoryWikiTitleRepository, WikiEntityHelper, ICountryTagsService } from '../..';
import { ExploreWikiEntities } from './exploreWikiEntities';
import { ConceptContainer } from '../../entities/conceptContainer';
import { PopularConceptNamesEnumerator } from '../popularConceptNamesEnumerator';

test('ro-md: partial name: Biblioteca Națională', async t => {
    const locale: Locale = { lang: 'ro', country: 'md' };

    const entityRep = new MemoryWikiEntityRepository();
    const conceptRep = new MemoryConceptRepository();
    const rootConceptRep = new MemoryRootNameRepository();
    const pushConcepts = new PushContextConcepts(conceptRep, rootConceptRep);
    const container: ConceptContainer = { id: '1', ...locale };
    const popularNamesEnumerator = new PopularConceptNamesEnumerator({ rootNames: true }, container, conceptRep, rootConceptRep);

    const bibliotecaNationala = ConceptHelper.create({ lang: locale.lang, country: locale.country, name: 'Biblioteca Națională', containerId: container.id });

    await pushConcepts.execute([bibliotecaNationala]);

    const exploreEntities = new ExploreWikiEntities(container, popularNamesEnumerator, entityRep,
        new MemoryWikiSearchNameRepository(), new MemoryWikiTitleRepository(), new CountryTags());

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
