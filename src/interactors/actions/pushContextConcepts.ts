
import { UseCase } from '@textactor/domain';
import { IConceptWriteRepository } from '../conceptRepository';
import { Concept } from '../../entities/concept';
import { ConceptHelper } from '../../entities/conceptHelper';

export class PushContextConcepts extends UseCase<Concept[], void, void> {
    constructor(private repository: IConceptWriteRepository) {
        super()
    }

    protected innerExecute(concepts: Concept[]): Promise<void> {
        concepts = concepts.filter(concept => ConceptHelper.isValid(concept));
        ConceptHelper.setConceptsContextNames(concepts);
        return Promise.all(concepts.map(concept => this.repository.createOrUpdate(concept)))
            .then(_ => null)
    }
}
