
import { MemoryConceptRepository } from './memoryConceptRepository';
import test from 'ava';
import { ConceptHelper } from '../entities/conceptHelper';

test('#create', async t => {
    const repository = new MemoryConceptRepository();
    const concept = ConceptHelper.create({ text: 'New York', abbr: 'NY', country: 'us', lang: 'en' });

    const createdConcept = await repository.create(concept);

    await t.throws(repository.create(concept), /Item already exists/i);

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

test('#getByIds', async t => {
    const repository = new MemoryConceptRepository();
    const concept1 = ConceptHelper.create({ text: 'New York', abbr: 'NY', country: 'us', lang: 'en' });
    await repository.create(concept1);
    const concept2 = ConceptHelper.create({ text: 'New York City', abbr: 'NY', country: 'us', lang: 'en' });
    await repository.create(concept2);
    const concepts = await repository.getByIds([concept1.id, concept2.id]);

    t.is(concepts.length, 2);
    t.is(concepts[0].id, concept1.id);
    t.is(concepts[1].id, concept2.id);
})

test('#deleteByNameHash', async t => {
    const repository = new MemoryConceptRepository();

    const concept1 = ConceptHelper.create({ text: 'Владимир Путин', country: 'ru', lang: 'ru' });
    await repository.deleteByNameHash([concept1.nameHash]);
    const concepts = await repository.getByNameHash(concept1.nameHash);

    t.is(concepts.length, 0);
})
