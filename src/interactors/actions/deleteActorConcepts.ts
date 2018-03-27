
import { UseCase } from "@textactor/domain";
import { IConceptWriteRepository } from "../conceptRepository";
import { ConceptActor, ConceptHelper } from "../../entities";

export class DeleteActorConcepts extends UseCase<ConceptActor, ConceptActor, void> {

    constructor(private conceptRepository: IConceptWriteRepository) {
        super()
    }

    protected async innerExecute(actor: ConceptActor): Promise<ConceptActor> {

        const ids = actor.concepts.map(item => item.id);
        await this.conceptRepository.deleteIds(ids);

        if (actor.partialNames && actor.partialNames.length) {
            await this.conceptRepository.deleteIds(actor.partialNames.map(name => ConceptHelper.id(name, actor.lang, actor.country)));
        }

        return actor;
    }
}
