
import { UseCase, uniq } from "@textactor/domain";
import { IConceptWriteRepository } from "../conceptRepository";
import { ConceptActor } from "../../entities/actor";
import { ConceptHelper } from "../../entities/conceptHelper";
import { IConceptRootNameWriteRepository } from "../conceptRootNameRepository";

export class DeleteActorConcepts extends UseCase<ConceptActor, ConceptActor, void> {

    constructor(private conceptRep: IConceptWriteRepository, private rootNameRep: IConceptRootNameWriteRepository) {
        super()
    }

    protected async innerExecute(actor: ConceptActor): Promise<ConceptActor> {

        const ids = actor.concepts.map(item => item.id);
        const rootIds = uniq(actor.concepts.map(item => item.rootNameId));
        await this.conceptRep.deleteIds(ids);
        await this.rootNameRep.deleteIds(rootIds);

        if (actor.partialNames && actor.partialNames.length) {
            await this.conceptRep.deleteIds(actor.partialNames.map(name => ConceptHelper.id(name, actor.lang, actor.country)));
        }

        return actor;
    }
}
