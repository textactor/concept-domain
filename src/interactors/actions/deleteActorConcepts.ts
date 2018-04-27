
import { UseCase, uniq } from "@textactor/domain";
import { IConceptWriteRepository } from "../conceptRepository";
import { ConceptActor } from "../../entities/actor";
// import { ConceptHelper } from "../../entities/conceptHelper";
import { IConceptRootNameWriteRepository } from "../conceptRootNameRepository";
import { RootNameHelper } from "../..";

export class DeleteActorConcepts extends UseCase<ConceptActor, ConceptActor, void> {

    constructor(private conceptRep: IConceptWriteRepository, private rootNameRep: IConceptRootNameWriteRepository) {
        super()
    }

    protected async innerExecute(actor: ConceptActor): Promise<ConceptActor> {

        const ids = actor.concepts.map(item => item.id);
        let rootIds: string[] = actor.concepts.reduce<string[]>((list, item) => list.concat(item.rootNameIds), []);
        rootIds = uniq(rootIds);

        await this.conceptRep.deleteIds(ids);
        await this.conceptRep.deleteByRootNameIds(rootIds);
        await this.rootNameRep.deleteIds(rootIds);


        if (actor.wikiEntity) {
            const wikiRootIds = RootNameHelper.idsFromNames(actor.wikiEntity.names, actor.lang, actor.country);
            await this.rootNameRep.deleteIds(wikiRootIds);
            await this.conceptRep.deleteByRootNameIds(wikiRootIds);
        }

        // if (actor.wikiEntity && actor.wikiEntity.partialNames && actor.wikiEntity.partialNames.length) {
        //     await this.conceptRep.deleteIds(actor.wikiEntity.partialNames.map(name => ConceptHelper.id(name, actor.lang, actor.country)));
        // }

        return actor;
    }
}
