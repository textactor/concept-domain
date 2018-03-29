
const debug = require('debug')('textactor:concept-domain');

import { UseCase, uniq, seriesPromise } from "@textactor/domain";
import { IWikiEntityReadRepository } from "../wikiEntityRepository";
import { IConceptReadRepository } from "../conceptRepository";
import { Locale } from "../../types";
import { PopularConceptNode } from "./getPopularConceptNode";
import { ConceptActor } from "../../entities/actor";
import { WikiEntityHelper } from "../../entities/wikiEntityHelper";
import { uniqProp } from "../../utils";
import { ActorHelper } from "../../entities/actorHelper";
import { ConceptHelper } from "../../entities/conceptHelper";
import { WikiEntity } from "../../entities/wikiEntity";



export class BuildActor extends UseCase<PopularConceptNode, ConceptActor, void> {

    constructor(private locale: Locale, private wikiEntityRepository: IWikiEntityReadRepository, private conceptRepository: IConceptReadRepository) {
        super()
    }

    protected async innerExecute(node: PopularConceptNode): Promise<ConceptActor> {

        const lang = this.locale.lang;
        const country = this.locale.country;
        const conceptNames = ConceptHelper.getConceptsNames(node.topConcepts, true);
        const wikiEntity = await this.findPerfectWikiEntity(conceptNames);

        let names = conceptNames;

        if (wikiEntity) {
            names = names.concat(wikiEntity.names);
            names = names.concat(wikiEntity.secondaryNames);
        }

        names = uniq(names).filter(name => WikiEntityHelper.isValidName(name));

        const conceptsIds = uniq(names.map(name => ConceptHelper.id(name, lang, country)));

        const concepts = await this.conceptRepository.getByIds(conceptsIds);

        const actor = ActorHelper.create(concepts, wikiEntity);

        debug(`Created actor(${actor.name}): concepts:${JSON.stringify(concepts.map(item => item.name))}, wikiEntity: ${wikiEntity && wikiEntity.name}`);

        return actor;
    }

    private async findPerfectWikiEntity(conceptNames: string[]): Promise<WikiEntity> {
        const nameHashes = uniq(conceptNames.map(name => WikiEntityHelper.nameHash(name, this.locale.lang)));

        let entities: WikiEntity[] = []

        await seriesPromise(nameHashes, nameHash => this.wikiEntityRepository.getByNameHash(nameHash)
            .then(list => entities = entities.concat(list)));

        if (entities.length) {
            debug(`Found wikientity by names: ${JSON.stringify(conceptNames)}`);
        } else {
            debug(`NOT Found wikientity by names: ${JSON.stringify(conceptNames)}`);
        }

        entities = uniqProp(entities, 'id');

        entities = this.sortWikiEntities(entities);

        const entity = entities[0];

        return entity;
    }

    private sortWikiEntities(entities: WikiEntity[]): WikiEntity[] {
        if (!entities.length) {
            return entities;
        }

        entities = entities.sort((a, b) => b.rank - a.rank);

        const topEntity = entities[0];

        const countryEntities = entities.filter(item => item.countryCode === this.locale.country);
        if (countryEntities.length && countryEntities[0].rank > topEntity.rank / 4) {
            entities = countryEntities.concat(entities);
        }

        return uniq(entities);
    }
}
