
import { SetAbbrConceptsLongName } from './setAbbrConceptsLongName';
import test from 'ava';
import { MemoryConceptRepository } from '../memoryConceptRepository';
import { PushContextConcepts } from './pushContextConcepts';
import { Locale } from '../../types';
import { ConceptHelper } from '../../entities/conceptHelper';

test('set concept abbrLongName', async t => {
    const conceptRepository = new MemoryConceptRepository();
    const pushConcepts = new PushContextConcepts(conceptRepository);
    const locale: Locale = { lang: 'ro', country: 'md' };

    const concepts = [
        ConceptHelper.create({ text: 'CEC', ...locale }),
        ConceptHelper.create({ text: 'Comisia Electorală Centrală', abbr: 'CEC', ...locale }),
    ];

    await pushConcepts.execute(concepts);

    const setLongName = new SetAbbrConceptsLongName(locale, conceptRepository);

    await setLongName.execute(null);

    const concept = await conceptRepository.getById(concepts[0].id);

    t.is(concept.id, concepts[0].id);
    t.is(concept.isAbbr, true);
    t.deepEqual(concept.abbrLongNames, [concepts[1].name]);
});
