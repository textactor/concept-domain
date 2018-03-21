
import { UseCase } from '@textactor/domain';
import { IConcept } from '../entities/concept';
import { IConceptWriteRepository } from './conceptRepository';

export class PushConcepts extends UseCase<IConcept[], void, void> {
    constructor(private repository: IConceptWriteRepository) {
        super()
    }

    protected innerExecute(concepts: IConcept[]): Promise<void> {
        return Promise.all(concepts.map(concept => this.repository.createOrIncrementPopularity(concept)))
            .then(_ => null)
    }
}
