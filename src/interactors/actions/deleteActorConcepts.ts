
import { UseCase, uniq } from "@textactor/domain";
import { IConceptWriteRepository } from "../conceptRepository";
import { IConceptRootNameWriteRepository } from "../conceptRootNameRepository";
import { ConceptContainer } from "../../entities/conceptContainer";
import { ConceptHelper } from "../../entities/conceptHelper";
import { RootNameHelper } from "../../entities/rootNameHelper";

export class DeleteActorConcepts extends UseCase<string[], void, void> {

    constructor(
        private container: ConceptContainer,
        private conceptRep: IConceptWriteRepository,
        private rootNameRep: IConceptRootNameWriteRepository) {
        super()
    }

    protected async innerExecute(names: string[]): Promise<void> {

        const lang = this.container.lang;
        const country = this.container.country;
        const containerId = this.container.id;

        let conceptIds = names.map(item => ConceptHelper.id(item, lang, country, containerId));
        conceptIds = uniq(conceptIds);

        let rootIds = RootNameHelper.idsFromNames(names, lang, country, containerId);
        rootIds = uniq(rootIds);

        await this.conceptRep.deleteIds(conceptIds);
        await this.conceptRep.deleteByRootNameIds(rootIds);
        await this.rootNameRep.deleteIds(rootIds);
    }
}
