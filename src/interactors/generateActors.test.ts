
import { GenerateActors } from './generateActors';
import test from 'ava';
import { MemoryConceptRepository } from './memoryConceptRepository';
import { MemoryWikiEntityRepository } from './memoryWikiEntityRepository';
import { ConceptHelper } from '../entities/conceptHelper';
import { PushConcepts } from './pushConcepts';
import { ILocale } from '../types';
import { IActor } from '..';

test('ro-md', async t => {
    const conceptRepository = new MemoryConceptRepository();
    const wikiEntityRepository = new MemoryWikiEntityRepository();
    const pushConcepts = new PushConcepts(conceptRepository);
    const locale: ILocale = { lang: 'ro', country: 'md' };
    const actorsGenerator = new GenerateActors(locale, conceptRepository, wikiEntityRepository);

    const conceptTexts: string[] = ['R. Moldova', 'Republica Moldova', 'Moldova', 'Republicii Moldova', 'Chișinău', 'Chisinau', 'Chisinaului', 'Adrian Ursu', 'Partidul Liberal', 'PDM', 'Partidul Democrat', 'PSRM'];

    const concepts = conceptTexts
        .map(text => ({ text, ...locale }))
        .map(text => ConceptHelper.create(text));

    await pushConcepts.execute(concepts);

    const inter = {
        onActor: (actor: IActor) => {
            t.true(!!actor);
            if (actor.wikiEntity) {
                delete actor.wikiEntity.data
            }
            console.log('------------NEW ACTOR------------');
            console.log(actor);
            console.log('------------------------');
        },
        onError: (error: Error) => console.log('Error', error)
    }

    await actorsGenerator.execute(inter);
});

