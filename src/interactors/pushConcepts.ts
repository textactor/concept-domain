
import { UseCase } from '@textactor/domain';
import { Concept } from '../entities/concept';
import { IConceptWriteRepository } from './conceptRepository';
import { ConceptHelper } from '..';

export class PushConcepts extends UseCase<Concept[], void, void> {
    constructor(private repository: IConceptWriteRepository) {
        super()
    }

    protected innerExecute(concepts: Concept[]): Promise<void> {
        ConceptHelper.setConceptsContextAbbr(concepts);
        return Promise.all(concepts.map(concept => this.repository.createOrIncrementPopularity(concept)))
            .then(_ => null)
    }
}
