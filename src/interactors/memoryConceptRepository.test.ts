
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

test('#getPopularRootNameHashes', async t => {
    const repository = new MemoryConceptRepository();

    const concept1 = ConceptHelper.create({ text: 'Владимир Путин', country: 'ru', lang: 'ru' });
    await repository.createOrUpdate(concept1);

    const concept2 = ConceptHelper.create({ text: 'Владимира Путина', country: 'ru', lang: 'ru' });
    await repository.createOrUpdate(concept2);

    const concept3 = ConceptHelper.create({ text: 'Виктор Зубков', country: 'ru', lang: 'ru' });
    await repository.createOrUpdate(concept3);

    const popularHashes = await repository.getPopularRootNameHashes({ country: 'ru', lang: 'ru' }, 2, 0);

    t.is(popularHashes.length, 2);
    t.is(popularHashes[0].hash, concept1.rootNameHash);
    t.is(popularHashes[0].popularity, 2);
    t.is(popularHashes[0].ids.length, 2);
    t.is(popularHashes[1].hash, concept3.rootNameHash);
    t.is(popularHashes[1].popularity, 1);
})


test('#deleteUnpopular', async t => {
    const repository = new MemoryConceptRepository();

    const concept1 = ConceptHelper.create({ text: 'Владимир Путин', country: 'ru', lang: 'ru' });
    await repository.createOrUpdate(concept1);
    await repository.createOrUpdate(concept1);

    const concept2 = ConceptHelper.create({ text: 'Владимира Путина', country: 'ru', lang: 'ru' });
    await repository.createOrUpdate(concept2);

    const concept3 = ConceptHelper.create({ text: 'Виктор Зубков', country: 'ru', lang: 'ru' });
    await repository.createOrUpdate(concept3);

    await repository.deleteUnpopular({ lang: 'ru', country: 'ru' }, 1);
    const popularHashes = await repository.getPopularRootNameHashes({ country: 'ru', lang: 'ru' }, 2, 0);

    t.is(popularHashes.length, 1);
    t.is(popularHashes[0].hash, concept1.rootNameHash);
    t.is(popularHashes[0].popularity, 2);
    t.is(popularHashes[0].ids.length, 1);
})

test('#deleteByNameHash', async t => {
    const repository = new MemoryConceptRepository();

    const concept1 = ConceptHelper.create({ text: 'Владимир Путин', country: 'ru', lang: 'ru' });
    await repository.deleteByNameHash([concept1.nameHash]);
    const concepts = await repository.getByNameHash(concept1.nameHash);

    t.is(concepts.length, 0);
})
