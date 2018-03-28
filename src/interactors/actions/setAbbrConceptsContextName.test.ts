
import { SetAbbrConceptsContextName } from './setAbbrConceptsContextName';
import test from 'ava';
import { MemoryConceptRepository } from '../memoryConceptRepository';
import { PushConcepts } from './pushConcepts';
import { Locale } from '../../types';
import { ConceptHelper } from '../../entities/conceptHelper';

test('set concept contextName', async t => {
    const conceptRepository = new MemoryConceptRepository();
    const pushConcepts = new PushConcepts(conceptRepository);
    const locale: Locale = { lang: 'ro', country: 'md' };

    const concepts = [
        ConceptHelper.create({ text: 'CEC', ...locale }),
        ConceptHelper.create({ text: 'Comisia Electorală Centrală', ...locale }),
    ];

    await pushConcepts.execute(concepts);

    const cecConcept = ConceptHelper.create({ text: 'CEC', ...locale });

    let concept = await conceptRepository.getById(cecConcept.id);
    t.is(concept.contextName, concepts[1].name);

    await pushConcepts.execute([cecConcept]);

    const setContextName = new SetAbbrConceptsContextName(locale, conceptRepository);

    await setContextName.execute(null);

    concept = await conceptRepository.getById(cecConcept.id);

    t.is(concept.id, concepts[0].id);
    t.is(concept.isAbbr, true);
    t.is(concept.contextName, concepts[1].name);
});
