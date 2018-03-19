
import { UseCase } from "@textactor/domain";
import { IConceptWriteRepository } from "../../conceptRepository";
import { IActor } from "../../../entities";

export class DeleteActorConcepts extends UseCase<IActor, IActor, void> {

    constructor(private conceptRepository: IConceptWriteRepository) {
        super()
    }

    protected async innerExecute(actor: IActor): Promise<IActor> {

        const ids = actor.concepts.map(item => item.id);
        await this.conceptRepository.deleteIds(ids);

        return actor;
    }
}
