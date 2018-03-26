
import { UseCase } from '@textactor/domain';
import { Concept } from '../entities/concept';
import { IConceptWriteRepository } from './conceptRepository';

export class PushConcepts extends UseCase<Concept[], void, void> {
    constructor(private repository: IConceptWriteRepository) {
        super()
    }

    protected innerExecute(concepts: Concept[]): Promise<void> {
        return Promise.all(concepts.map(concept => this.repository.createOrIncrementPopularity(concept)))
            .then(_ => null)
    }
}
