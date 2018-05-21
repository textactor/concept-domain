
const debug = require('debug')('textactor:concept-domain');

import { UseCase } from "@textactor/domain";
import { IWikiEntityReadRepository } from "../wikiEntityRepository";
import { IConceptReadRepository } from "../conceptRepository";
import { ConceptActor } from "../../entities/actor";
import { ActorHelper } from "../../entities/actorHelper";
import { ConceptHelper } from "../../entities/conceptHelper";
import { ConceptContainer } from "../../entities/conceptContainer";
import { SelectWikiEntity } from "./selectWikiEntity";


export class BuildActor extends UseCase<string, ConceptActor, void> {
    private selectWikiEntity: SelectWikiEntity;

    constructor(private container: ConceptContainer,
        wikiEntityRepository: IWikiEntityReadRepository,
        private conceptRepository: IConceptReadRepository) {
        super()

        this.selectWikiEntity = new SelectWikiEntity(container, wikiEntityRepository);
    }

    protected async innerExecute(rootId: string): Promise<ConceptActor> {

        const lang = this.container.lang;
        const country = this.container.country;

        const rootIdConcepts = await this.conceptRepository.getByRootNameId(rootId);
        if (rootIdConcepts.length === 0) {
            debug(`NO root concepts for ${rootId}`);
            return null;
        }
        const conceptNames = ConceptHelper.getConceptsNames(rootIdConcepts, true);
        const wikiEntity = await this.selectWikiEntity.execute(conceptNames);

        let names: string[] = ConceptHelper.getConceptsNames(rootIdConcepts, false);

        const actor = ActorHelper.build({ lang, country }, names, wikiEntity);

        debug(`Created actor(${actor.name}): concepts:${JSON.stringify(names)}, wikiEntity: ${wikiEntity && wikiEntity.name}`);

        return actor;
    }
}
