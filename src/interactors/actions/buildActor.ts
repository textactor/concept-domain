
const debug = require('debug')('textactor:concept-domain');

import { UseCase, uniq, seriesPromise } from "@textactor/domain";
import { IWikiEntityReadRepository } from "../wikiEntityRepository";
import { IConceptReadRepository } from "../conceptRepository";
import { Locale } from "../../types";
import { ConceptActor } from "../../entities/actor";
import { WikiEntityHelper } from "../../entities/wikiEntityHelper";
import { uniqProp } from "../../utils";
import { ActorHelper } from "../../entities/actorHelper";
import { ConceptHelper } from "../../entities/conceptHelper";
import { WikiEntity } from "../../entities/wikiEntity";
import { RootNameHelper, Concept } from "../..";


export class BuildActor extends UseCase<string, ConceptActor, void> {

    constructor(private locale: Locale,
        private wikiEntityRepository: IWikiEntityReadRepository,
        private conceptRepository: IConceptReadRepository) {
        super()
    }

    protected async innerExecute(rootId: string): Promise<ConceptActor> {

        const lang = this.locale.lang;
        const country = this.locale.country;
        const rootIdConcepts = await this.conceptRepository.getByRootNameId(rootId);
        if (rootIdConcepts.length === 0) {
            debug(`NO root concepts for ${rootId}`);
            return null;
        }
        const conceptNames = ConceptHelper.getConceptsNames(rootIdConcepts, true);
        const wikiEntity = await this.findPerfectWikiEntity(conceptNames);

        let concepts: Concept[]

        if (wikiEntity) {
            let names = ConceptHelper.getConceptsNames(rootIdConcepts, false);
            names = names.concat(wikiEntity.names);
            names = uniq(names).filter(name => WikiEntityHelper.isValidName(name));
            const rootIds = uniq(names.map(name => RootNameHelper.idFromName(name, lang, country)));
            concepts = await this.conceptRepository.getByRootNameIds(rootIds);
            // names = names.concat(wikiEntity.secondaryNames);
        } else {
            // debug(JSON.stringify(node));
            concepts = rootIdConcepts;
        }

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

        if (entities.length === 0 || this.countryWikiEntities(entities).length === 0) {
            let entitiesByPartialNames: WikiEntity[] = []
            await seriesPromise(nameHashes, nameHash => this.wikiEntityRepository.getByPartialNameHash(nameHash)
                .then(list => entitiesByPartialNames = entitiesByPartialNames.concat(list)));

            entitiesByPartialNames = entitiesByPartialNames.filter(item => item.countryCode === this.locale.country);
            if (entitiesByPartialNames.length) {
                debug(`found locale entities by partial name: ${entitiesByPartialNames.map(item => item.name)}`);
                entities = entities.concat(entitiesByPartialNames);
            }

            if (entities.length === 0) {
                debug(`NOT Found wikientity by partial names: ${JSON.stringify(conceptNames)}`);
                return null;
            }
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

    private countryWikiEntities(entities: WikiEntity[]): WikiEntity[] {
        if (!entities.length) {
            return entities;
        }
        return entities.filter(item => item.countryCode === this.locale.country);
    }
}
