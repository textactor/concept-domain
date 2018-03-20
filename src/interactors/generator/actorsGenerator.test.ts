
import { ActorsGenerator, IActorsGenerator } from './actorsGenerator';
import test from 'ava';
import { MemoryConceptRepository } from '../memoryConceptRepository';
import { MemoryWikiEntityRepository } from '../memoryWikiEntityRepository';
import { ConceptHelper } from '../../entities/conceptHelper';
import { PushConceptsUseCase } from '..';
import { ILocale } from '../../types';

test('ro-md', async t => {
    const conceptRepository = new MemoryConceptRepository();
    const wikiEntityRepository = new MemoryWikiEntityRepository();
    const pushConcepts = new PushConceptsUseCase(conceptRepository);
    const locale: ILocale = { lang: 'ro', country: 'md' };
    const actorsGenerator: IActorsGenerator = new ActorsGenerator(locale, { concept: conceptRepository, wikiEntity: wikiEntityRepository },
        { minConceptPopularity: 0, minAbbrConceptPopularity: 0, minOneWordConceptPopularity: 0 });

    const conceptTexts: string[] = ['R. Moldova', 'Republica Moldova', 'Moldova', 'Republicii Moldova', 'Chișinău', 'Chisinau', 'Chisinaului', 'Adrian Ursu', 'Partidul Liberal', 'PDM', 'Partidul Democrat', 'PSRM'];

    const concepts = conceptTexts
        .map(text => ({ text, ...locale }))
        .map(text => ConceptHelper.create(text));

    await pushConcepts.execute(concepts);

    actorsGenerator.onEnd(() => console.log('END'));
    actorsGenerator.onError((error) => console.log('Error', error));

    actorsGenerator.onActor((actor) => {
        t.true(!!actor);
        if (actor.wikiEntity) {
            delete actor.wikiEntity.data
        }
        console.log('------------NEW ACTOR------------');
        console.log(actor);
        console.log('------------------------');
    });

    await actorsGenerator.start();
});

