
import { SetAbbrConceptsLongName } from './setAbbrConceptsLongName';
import test from 'ava';
import { MemoryConceptRepository } from '../memoryConceptRepository';
import { PushContextConcepts } from './pushContextConcepts';
import { Locale } from '../../types';
import { ConceptHelper } from '../../entities/conceptHelper';
import { MemoryRootNameRepository } from '../memoryRootNameRepository';
import { ConceptContainer } from '../../entities/conceptContainer';

test('set concept abbrLongName', async t => {
    const conceptRepository = new MemoryConceptRepository();
    const rootNameRep = new MemoryRootNameRepository();
    const pushConcepts = new PushContextConcepts(conceptRepository, rootNameRep);
    const locale: Locale = { lang: 'ro', country: 'md' };
    const container: ConceptContainer = { id: '1', ...locale };

    const concepts = [
        ConceptHelper.create({ name: 'CEC', containerId: '1', ...locale }),
        ConceptHelper.create({ name: 'Comisia Electorală Centrală', abbr: 'CEC', containerId: '1', ...locale }),
    ];

    await pushConcepts.execute(concepts);

    const setLongName = new SetAbbrConceptsLongName(container, conceptRepository);

    await setLongName.execute(null);

    const concept = await conceptRepository.getById(concepts[0].id);

    t.is(concept.id, concepts[0].id);
    t.is(concept.isAbbr, true);
    t.deepEqual(concept.abbrLongNames, [concepts[1].name]);
});
