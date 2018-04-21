
import { SetAbbrConceptsContextName } from './setAbbrConceptsContextName';
import test from 'ava';
import { MemoryConceptRepository } from '../memoryConceptRepository';
import { PushContextConcepts } from './pushContextConcepts';
import { Locale } from '../../types';
import { ConceptHelper } from '../../entities/conceptHelper';
import { MemoryRootNameRepository } from '../memoryRootNameRepository';

test('set concept contextName', async t => {
    const conceptRepository = new MemoryConceptRepository();
    const rootNameRep = new MemoryRootNameRepository();
    const pushConcepts = new PushContextConcepts(conceptRepository, rootNameRep);
    const locale: Locale = { lang: 'ro', country: 'md' };

    const concepts = [
        ConceptHelper.create({ name: 'CEC', ...locale }),
        ConceptHelper.create({ name: 'Comisia Electorală Centrală', ...locale }),
    ];

    await pushConcepts.execute(concepts);

    const cecConcept = ConceptHelper.create({ name: 'CEC', ...locale });

    let concept = await conceptRepository.getById(cecConcept.id);
    t.deepEqual(concept.contextNames, [concepts[1].name]);

    await pushConcepts.execute([cecConcept]);

    const setContextName = new SetAbbrConceptsContextName(locale, conceptRepository);

    await setContextName.execute(null);

    concept = await conceptRepository.getById(cecConcept.id);

    t.is(concept.id, concepts[0].id);
    t.is(concept.isAbbr, true);
    t.deepEqual(concept.contextNames, [concepts[1].name]);
});
