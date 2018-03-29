
import { UseCase } from '@textactor/domain';
import { IConceptWriteRepository } from '../conceptRepository';
import { Concept } from '../../entities/concept';
import { ConceptHelper } from '../../entities/conceptHelper';

export class PushContextConcepts extends UseCase<Concept[], void, void> {
    constructor(private repository: IConceptWriteRepository) {
        super()
    }

    protected innerExecute(concepts: Concept[]): Promise<void> {
        ConceptHelper.setConceptsContextNames(concepts);
        return Promise.all(concepts.map(concept => this.repository.createOrIncrement(concept)))
            .then(_ => null)
    }
}
