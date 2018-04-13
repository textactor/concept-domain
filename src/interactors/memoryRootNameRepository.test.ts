
import test from 'ava';
import { MemoryRootNameRepository, RootNameHelper } from '..';

test('#create', async t => {
    const repository = new MemoryRootNameRepository();
    const rootName = RootNameHelper.create({ name: 'New York', country: 'us', lang: 'en' });

    const createdConcept = await repository.create(rootName);

    await t.throws(repository.create(rootName), /Item already exists/i);

    t.is(createdConcept.name, rootName.name);

    rootName.name = 'New Name';

    t.not(createdConcept.name, rootName.name);
})

test('#getById', async t => {
    const repository = new MemoryRootNameRepository();
    const rootName = RootNameHelper.create({ name: 'New York', country: 'us', lang: 'en' });
    await repository.create(rootName);
    const concept1 = await repository.getById(rootName.id);
    t.true(!!concept1);

    const concept2 = await repository.getById('fake');
    t.false(!!concept2);
})

test('#getByIds', async t => {
    const repository = new MemoryRootNameRepository();
    const concept1 = RootNameHelper.create({ name: 'New York', country: 'us', lang: 'en' });
    await repository.create(concept1);
    const concept2 = RootNameHelper.create({ name: 'New York City', country: 'us', lang: 'en' });
    await repository.create(concept2);
    const concepts = await repository.getByIds([concept1.id, concept2.id]);

    t.is(concepts.length, 2);
    t.is(concepts[0].id, concept1.id);
    t.is(concepts[1].id, concept2.id);
})

test('#getPopularRootNameHashes', async t => {
    const repository = new MemoryRootNameRepository();

    const concept1 = RootNameHelper.create({ name: 'Владимир Путин', country: 'ru', lang: 'ru' });
    await repository.createOrUpdate(concept1);

    const concept2 = RootNameHelper.create({ name: 'Владимира Путина', country: 'ru', lang: 'ru' });
    await repository.createOrUpdate(concept2);

    const concept3 = RootNameHelper.create({ name: 'Виктор Зубков', country: 'ru', lang: 'ru' });
    await repository.createOrUpdate(concept3);

    const popularIds = await repository.getMostPopularIds({ country: 'ru', lang: 'ru' }, 2, 0);
    const popularRootNames = await repository.getByIds(popularIds);

    t.is(popularRootNames.length, 2);
    t.is(popularRootNames[0].popularity, 2);
    t.is(popularRootNames[1].popularity, 1);
})


test('#deleteUnpopular', async t => {
    const repository = new MemoryRootNameRepository();

    const concept1 = RootNameHelper.create({ name: 'Владимир Путин', country: 'ru', lang: 'ru' });
    await repository.createOrUpdate(concept1);
    await repository.createOrUpdate(concept1);

    const concept2 = RootNameHelper.create({ name: 'Владимира Путина', country: 'ru', lang: 'ru' });
    await repository.createOrUpdate(concept2);

    const concept3 = RootNameHelper.create({ name: 'Виктор Зубков', country: 'ru', lang: 'ru' });
    await repository.createOrUpdate(concept3);

    await repository.deleteUnpopular({ lang: 'ru', country: 'ru' }, 1);
    
    const popularIds = await repository.getMostPopularIds({ country: 'ru', lang: 'ru' }, 2, 0);
    const popularRootNames = await repository.getByIds(popularIds);

    t.is(popularRootNames.length, 1);
    t.is(popularRootNames[0].popularity, 3);
})
