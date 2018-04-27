
import { UseCase } from '@textactor/domain';
import { IConceptWriteRepository } from '../conceptRepository';
import { Concept } from '../../entities/concept';
import { ConceptHelper } from '../../entities/conceptHelper';
import { IConceptRootNameRepository } from '../conceptRootNameRepository';
import { RootNameHelper } from '../../entities/rootNameHelper';

export class PushContextConcepts extends UseCase<Concept[], Concept[], void> {
    constructor(private conceptRep: IConceptWriteRepository, private rootNameRep: IConceptRootNameRepository) {
        super()
    }

    protected innerExecute(concepts: Concept[]): Promise<Concept[]> {
        concepts = concepts.filter(concept => ConceptHelper.isValid(concept));
        ConceptHelper.setConceptsContextNames(concepts);
        // const list: Concept[] = []
        return Promise.all(concepts.map(concept => this.pushConcept(concept)));
        // return seriesPromise(concepts, concept => this.pushConcept(concept).then(item => list.push(item)))
        //     .then(() => list);
    }

    private async pushConcept(concept: Concept): Promise<Concept> {
        const rootName = RootNameHelper.create({ name: concept.name, lang: concept.lang, country: concept.country });

        await this.rootNameRep.createOrUpdate(rootName);

        if (concept.knownName) {
            const knownRootName = RootNameHelper.create({ name: concept.knownName, lang: concept.lang, country: concept.country });
            if (knownRootName.id !== rootName.id) {
                await this.rootNameRep.createOrUpdate(knownRootName);
            }
        }

        return await this.conceptRep.createOrUpdate(concept);
    }
}
