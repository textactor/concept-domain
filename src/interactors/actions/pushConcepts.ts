
import { UseCase } from '@textactor/domain';
import { IConceptWriteRepository } from '../conceptRepository';
import { Concept } from '../../entities/concept';
import { ConceptHelper } from '../../entities/conceptHelper';

export class PushConcepts extends UseCase<Concept[], void, void> {
    constructor(private repository: IConceptWriteRepository) {
        super()
    }

    protected innerExecute(concepts: Concept[]): Promise<void> {
        ConceptHelper.setConceptsContextName(concepts);
        return Promise.all(concepts.map(concept => this.repository.createOrIncrementPopularity(concept)))
            .then(_ => null)
    }
}
