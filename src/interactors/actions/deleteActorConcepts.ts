
import { UseCase } from "@textactor/domain";
import { IConceptWriteRepository } from "../conceptRepository";
import { ConceptActor } from "../../entities";

export class DeleteActorConcepts extends UseCase<ConceptActor, ConceptActor, void> {

    constructor(private conceptRepository: IConceptWriteRepository) {
        super()
    }

    protected async innerExecute(actor: ConceptActor): Promise<ConceptActor> {

        const ids = actor.concepts.map(item => item.id);
        await this.conceptRepository.deleteIds(ids);

        return actor;
    }
}
