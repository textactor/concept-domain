
import { MemoryConceptRepository } from './memoryConceptRepository';
import test from 'ava';
import { ConceptHelper } from '../entities/conceptHelper';

test('#create', async t => {
    const repository = new MemoryConceptRepository();
    const concept = ConceptHelper.create({ text: 'New York', abbr: 'NY', country: 'us', lang: 'en' });

    const createdConcept = await repository.create(concept);

    t.is(createdConcept.name, concept.name);
    t.is(createdConcept.abbr, concept.abbr);

    concept.name = 'New Name';

    t.not(createdConcept.name, concept.name);
})

test('#getById', async t => {
    const repository = new MemoryConceptRepository();
    const concept = ConceptHelper.create({ text: 'New York', abbr: 'NY', country: 'us', lang: 'en' });
    await repository.create(concept);
    const concept1 = await repository.getById(concept.id);
    t.true(!!concept1);

    const concept2 = await repository.getById('fake');
    t.false(!!concept2);
})
