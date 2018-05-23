
import test from 'ava';
import { PopularConceptNamesEnumerator } from './popularConceptNamesEnumerator';
import { ConceptContainerHelper, MemoryConceptRepository, MemoryRootNameRepository, PushContextConcepts, ConceptHelper } from '..';


test('empty list', async t => {
    const container = ConceptContainerHelper.build({
        lang: 'ro',
        country: 'ro',
        name: 'Name',
        uniqueName: 'name',
        ownerId: 'id',
    });

    const conceptRep = new MemoryConceptRepository();
    const rootRep = new MemoryRootNameRepository();

    const enumerator = new PopularConceptNamesEnumerator({ rootNames: true }, container, conceptRep, rootRep);

    t.is(enumerator.atEnd(), false);
    const names = await enumerator.next();
    t.true(Array.isArray(names), 'is array');
    t.is(names.length, 0, 'no names');
    t.is(enumerator.atEnd(), true);
});

test('names with root name', async t => {
    const lang = 'ro';
    const country = 'ro';
    const container = ConceptContainerHelper.build({
        lang,
        country,
        name: 'Name',
        uniqueName: 'name',
        ownerId: 'id',
    });

    const containerId = container.id;

    const conceptRep = new MemoryConceptRepository();
    const rootRep = new MemoryRootNameRepository();

    const pushConcepts = new PushContextConcepts(conceptRep, rootRep);

    await pushConcepts.execute([
        ConceptHelper.build({ containerId, lang, country, name: 'Maia Sandu' }),
        ConceptHelper.build({ containerId, lang, country, name: 'Maiei Sandu' }),
        ConceptHelper.build({ containerId, lang, country, name: 'Partidul Liberal' }),
        ConceptHelper.build({ containerId, lang, country, name: 'Facebook' }),
    ]);

    const enumerator = new PopularConceptNamesEnumerator({ rootNames: false }, container, conceptRep, rootRep);

    t.is(enumerator.atEnd(), false);
    let names = await enumerator.next();
    // console.log(names);
    t.is(names.length, 2, 'Maia Sandu 2 names');
    t.true(['Maia Sandu', 'Maiei Sandu'].indexOf(names[0]) > -1);
    t.true(['Maia Sandu', 'Maiei Sandu'].indexOf(names[1]) > -1);
    t.is(enumerator.atEnd(), false);

    names = await enumerator.next();
    // console.log(names);
    t.is(names.length, 1);
    t.is(names[0], 'Partidul Liberal');
    t.is(enumerator.atEnd(), false);

    names = await enumerator.next();
    // console.log(names);
    t.is(names.length, 1);
    t.is(names[0], 'Facebook');
    t.is(enumerator.atEnd(), false);
    names = await enumerator.next();
    t.is(names.length, 0);

    t.is(enumerator.atEnd(), true);
});
