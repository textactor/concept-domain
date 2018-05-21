
// const debug = require('debug')('textactor:concept-domain');

import { UseCase } from "@textactor/domain";
import { IWikiEntityReadRepository } from "../wikiEntityRepository";
import { ConceptActor } from "../../entities/actor";
import { ActorHelper } from "../../entities/actorHelper";
import { ConceptContainer } from "../../entities/conceptContainer";
import { SelectWikiEntity } from "./selectWikiEntity";


export class BuildActorByNames extends UseCase<string[], ConceptActor, void> {
    private selectWikiEntity: SelectWikiEntity;

    constructor(private container: ConceptContainer,
        wikiEntityRepository: IWikiEntityReadRepository) {
        super()

        this.selectWikiEntity = new SelectWikiEntity(container, wikiEntityRepository);
    }

    protected async innerExecute(names: string[]): Promise<ConceptActor> {

        const wikiEntity = await this.selectWikiEntity.execute(names);

        const actor = ActorHelper.build({ lang: this.container.lang, country: this.container.country }, names, wikiEntity);

        return actor;
    }
}
