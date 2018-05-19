
const debug = require('debug')('textactor:concept-domain');

import { UseCase, uniq } from "@textactor/domain";
import { IWikiEntityReadRepository } from "../wikiEntityRepository";
import { IConceptReadRepository } from "../conceptRepository";
import { ConceptActor } from "../../entities/actor";
import { WikiEntityHelper } from "../../entities/wikiEntityHelper";
import { ActorHelper } from "../../entities/actorHelper";
import { ConceptHelper } from "../../entities/conceptHelper";
import { RootNameHelper, Concept } from "../..";
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
        const containerId = this.container.id;

        const rootIdConcepts = await this.conceptRepository.getByRootNameId(rootId);
        if (rootIdConcepts.length === 0) {
            debug(`NO root concepts for ${rootId}`);
            return null;
        }
        const conceptNames = ConceptHelper.getConceptsNames(rootIdConcepts, true);
        const wikiEntity = await this.selectWikiEntity.execute(conceptNames);

        let concepts: Concept[]

        if (wikiEntity) {
            let names = ConceptHelper.getConceptsNames(rootIdConcepts, false);
            names = names.concat(wikiEntity.names);
            names = uniq(names).filter(name => WikiEntityHelper.isValidName(name));
            const rootIds = RootNameHelper.idsFromNames(names, lang, country, containerId);
            concepts = await this.conceptRepository.getByRootNameIds(rootIds);
        } else {
            concepts = rootIdConcepts;
        }

        const actor = ActorHelper.create(concepts, wikiEntity);

        debug(`Created actor(${actor.name}): concepts:${JSON.stringify(concepts.map(item => item.name))}, wikiEntity: ${wikiEntity && wikiEntity.name}`);

        return actor;
    }
}
