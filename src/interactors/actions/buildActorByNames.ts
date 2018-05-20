
const debug = require('debug')('textactor:concept-domain');

import { UseCase, uniq } from "@textactor/domain";
import { IWikiEntityReadRepository } from "../wikiEntityRepository";
import { ConceptActor } from "../../entities/actor";
import { WikiEntityHelper } from "../../entities/wikiEntityHelper";
import { ActorHelper } from "../../entities/actorHelper";
import { Locale } from "../../types";
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

        if (wikiEntity) {
            names = names.concat(wikiEntity.names);
            if (wikiEntity.countryCodes && wikiEntity.countryCodes.indexOf(this.container.country) > -1) {
                debug(`adding partial names to actor: ${wikiEntity.partialNames}`);
                names = names.concat(wikiEntity.partialNames);
            }
            names = uniq(names).filter(name => WikiEntityHelper.isValidName(name));
        }

        const locale: Locale = {
            lang: this.container.lang,
            country: this.container.country,
        };

        const actor = ActorHelper.build(locale, names, wikiEntity);

        return actor;
    }
}
