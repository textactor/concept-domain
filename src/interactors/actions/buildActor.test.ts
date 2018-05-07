
import { BuildActor } from './buildActor';
import test from 'ava';
import { Locale, MemoryWikiEntityRepository, MemoryConceptRepository, PushContextConcepts, MemoryRootNameRepository, ConceptHelper, MemoryWikiSearchNameRepository, MemoryWikiTitleRepository, WikiEntityHelper } from '../..';
import { ExploreWikiEntities } from './exploreWikiEntities';

test('ro-md: partial name: Biblioteca Națională', async t => {
    const locale: Locale = { lang: 'ro', country: 'md' };

    const entityRep = new MemoryWikiEntityRepository();
    const conceptRep = new MemoryConceptRepository();
    const rootConceptRep = new MemoryRootNameRepository();

    const pushConcepts = new PushContextConcepts(conceptRep, rootConceptRep);

    const bibliotecaNationala = ConceptHelper.create({ lang: locale.lang, country: locale.country, name: 'Biblioteca Națională' });

    await pushConcepts.execute([bibliotecaNationala]);

    const exploreEntities = new ExploreWikiEntities(locale, conceptRep, rootConceptRep, entityRep,
        new MemoryWikiSearchNameRepository(), new MemoryWikiTitleRepository());

    await exploreEntities.execute(null);

    const exploredEntities = await entityRep
        .getByNameHash(WikiEntityHelper.nameHash('Biblioteca Națională a Republicii Moldova', locale.lang));

    t.is(exploredEntities.length, 1, 'Explored `Biblioteca Națională a Republicii Moldova`');

    const buildActor = new BuildActor(locale, entityRep, conceptRep);

    const actor = await buildActor.execute(bibliotecaNationala.rootNameIds[0]);

    t.is(!!actor, true, 'Actor exists');

    t.is(actor.name, 'Biblioteca Națională a Republicii Moldova');
});
