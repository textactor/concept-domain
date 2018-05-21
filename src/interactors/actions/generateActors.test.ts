
import { GenerateActors } from './generateActors';
import test from 'ava';
import { MemoryConceptRepository } from '../memoryConceptRepository';
import { MemoryWikiEntityRepository } from '../memoryWikiEntityRepository';
import { Locale } from '../../types';
import { PushContextConcepts } from './pushContextConcepts';
import { ConceptHelper } from '../../entities/conceptHelper';
import { ConceptActor } from '../../entities/actor';
import { MemoryRootNameRepository } from '../memoryRootNameRepository';
import { ConceptContainer } from '../../entities/conceptContainer';
import { PopularConceptNamesEnumerator } from '../popularConceptNamesEnumerator';
import { DeleteActorConcepts } from './deleteActorConcepts';

test('ro-md', async t => {
    const conceptRepository = new MemoryConceptRepository();
    const wikiEntityRepository = new MemoryWikiEntityRepository();
    const rootNameRep = new MemoryRootNameRepository();
    const pushConcepts = new PushContextConcepts(conceptRepository, rootNameRep);
    const locale: Locale = { lang: 'ro', country: 'md' };
    const container: ConceptContainer = { id: '1', ...locale };
    const namesEnumerator = new PopularConceptNamesEnumerator({ rootNames: false }, container, conceptRepository, rootNameRep);
    const actorsGenerator = new GenerateActors(container, namesEnumerator, new DeleteActorConcepts(container, conceptRepository, rootNameRep), wikiEntityRepository);

    const conceptTexts: string[] = ['R. Moldova', 'Republica Moldova', 'Moldova', 'Republicii Moldova', 'Chișinău', 'Chisinau', 'Chisinaului', 'Adrian Ursu', 'Partidul Liberal', 'PDM', 'Partidul Democrat', 'PSRM'];

    const concepts = conceptTexts
        .map(name => ConceptHelper.build({ name, containerId: container.id, ...locale }));

    await pushConcepts.execute(concepts);

    const onActor = (actor: ConceptActor) => {
        t.true(!!actor);
        // t.true(actor.popularity > 0);
        return Promise.resolve();
    };

    await actorsGenerator.execute(onActor);
});

// class NameCorrection implements INameCorrectionService {
//     correct(_name: string, _lang: string, _country?: string): Promise<string> {
//         return Promise.resolve(null);
//     }
// }
