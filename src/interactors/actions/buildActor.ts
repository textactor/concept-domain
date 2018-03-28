
const debug = require('debug')('textactor:concept-domain');

import { UseCase, uniq, NameHelper, seriesPromise } from "@textactor/domain";
import { IWikiEntityReadRepository } from "../wikiEntityRepository";
import { IConceptReadRepository } from "../conceptRepository";
import { Locale } from "../../types";
import { PopularConceptNode } from "./getPopularConceptNode";
import { ConceptActor } from "../../entities/actor";
import { WikiEntityHelper } from "../../entities/wikiEntityHelper";
import { uniqProp } from "../../utils";
import { ActorHelper } from "../../entities/actorHelper";
import { ConceptHelper } from "../../entities/conceptHelper";
import { Concept } from "../../entities/concept";
import { WikiEntity } from "../../entities/wikiEntity";



export class BuildActor extends UseCase<PopularConceptNode, ConceptActor, void> {

    constructor(private locale: Locale, private wikiEntityRepository: IWikiEntityReadRepository, private conceptRepository: IConceptReadRepository) {
        super()
    }

    protected async innerExecute(node: PopularConceptNode): Promise<ConceptActor> {

        const wikiEntityNames = await this.findPerfectWikiEntity(node.topConcepts);
        const wikiEntity = wikiEntityNames && wikiEntityNames.entity;

        const nodeConcepts = await this.conceptRepository.getByIds(node.ids);

        let names = nodeConcepts.map(item => item.name);

        if (wikiEntity) {
            names = names.concat(wikiEntity.names);
            names = names.concat(wikiEntityNames.names);
        }

        names = uniq(names);

        let rootNames = names.map(item => ConceptHelper.rootName(item, this.locale.lang));

        rootNames = uniq(rootNames);

        let rootNamesHashes = rootNames.map(item => ConceptHelper.nameHash(item, this.locale.lang, this.locale.country));

        rootNamesHashes = uniq(rootNamesHashes);

        let allConcepts: Concept[] = []

        await seriesPromise(rootNamesHashes, nameHash => this.conceptRepository.getByRootNameHash(nameHash)
            .then(concepts => allConcepts = allConcepts.concat(concepts)));

        allConcepts = uniqProp(allConcepts, 'id');
        allConcepts = allConcepts.sort((a, b) => b.popularity - a.popularity);

        const actor = ActorHelper.create(allConcepts, wikiEntity, wikiEntityNames && wikiEntityNames.names, node.topConcepts[0]);

        return actor;
    }

    private async findPerfectWikiEntity(concepts: Concept[]): Promise<WikiEntityNames> {
        const concept = concepts[0];
        let nameHashes = concepts.map(item => WikiEntityHelper.nameHash(item.name, this.locale.lang));
        nameHashes = uniq(nameHashes);

        let entities: WikiEntityNames[] = []

        seriesPromise(nameHashes, nameHash => this.wikiEntityRepository.getByNameHash(nameHash)
            .then(list => entities = entities.concat(list.map(entity => ({ entity, names: [] })))));

        if (concept.isAbbr && concept.contextName) {
            if (this.getCountryWikiEntities(entities).length === 0) {
                debug(`finding by contextName: ${concept.contextName}`)
                const list = await this.wikiEntityRepository.getByNameHash(WikiEntityHelper.nameHash(concept.contextName, this.locale.lang));
                debug(`found by contextName: ${list.map(item => item.name)}`);
                entities = entities.concat(list.map(entity => ({ entity, names: [concept.contextName] })));
            }
        }

        if (this.getCountryWikiEntities(entities).length === 0) {
            const names = [concept.name, concept.contextName].filter(name => !!name && !NameHelper.isAbbr(name));
            if (names.length) {
                debug(`finding by partial names: ${JSON.stringify(names)}`);
                let list: WikiEntityNames[] = [];
                await seriesPromise(names, name => this.wikiEntityRepository.getByPartialNameHash(WikiEntityHelper.nameHash(name, this.locale.lang))
                    .then(results => list = list.concat(results.map(entity => ({ entity, names: [name] })))));
                debug(`found by partial names: ${list.map(item => item.entity.name)}`);
                entities = entities.concat(list);
            }
        }

        const entitiesMap: Map<string, WikiEntityNames> = new Map();
        for (let entityName of entities) {
            const existingItem = entitiesMap.get(entityName.entity.id);
            if (existingItem) {
                if (entityName.names.length) {
                    existingItem.names = existingItem.names.concat(entityName.names);
                }
            } else {
                entitiesMap.set(entityName.entity.id, entityName);
            }
        }

        entities = [];
        for (let item of entitiesMap.values()) {
            entities.push(item);
        }

        entities = this.sortWikiEntities(entities);

        return entities[0];
    }

    private getCountryWikiEntities(entities: WikiEntityNames[]): WikiEntityNames[] {
        return entities.filter(item => item.entity.countryCode === this.locale.country);
    }

    private sortWikiEntities(entities: WikiEntityNames[]): WikiEntityNames[] {
        if (!entities.length) {
            return entities;
        }

        entities = entities.sort((a, b) => b.entity.rank - a.entity.rank);

        const topEntity = entities[0];

        const countryEntities = entities.filter(item => item.entity.countryCode === this.locale.country);
        if (countryEntities.length && countryEntities[0].entity.rank > topEntity.entity.rank / 2) {
            entities = countryEntities.concat(entities);
        }

        return uniq(entities);
    }
}

type WikiEntityNames = {
    entity: WikiEntity
    names: string[]
}
