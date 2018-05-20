
import { UseCase } from "@textactor/domain";
import { IConceptWriteRepository } from "../conceptRepository";
import { IConceptRootNameWriteRepository } from "../conceptRootNameRepository";
import { ConceptContainer } from "../../entities/conceptContainer";

export class CleanConceptContainer extends UseCase<ConceptContainer, void, void> {

    constructor(
        private conceptRep: IConceptWriteRepository,
        private rootNameRep: IConceptRootNameWriteRepository) {
        super()
    }

    protected async innerExecute(container: ConceptContainer): Promise<void> {
        await this.conceptRep.deleteAll(container.id);
        await this.rootNameRep.deleteAll(container.id);
    }
}
