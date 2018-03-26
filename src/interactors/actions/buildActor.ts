
const debug = require('debug')('textactor:concept-domain');

import { UseCase, NameHelper, uniq } from "@textactor/domain";
import { WikiEntity, Concept } from "../../entities";
import { IWikiEntityReadRepository } from "../wikiEntityRepository";
import { IConceptReadRepository } from "../conceptRepository";
import { ILocale } from "../../types";
import { PopularConceptNode } from "./getPopularConceptNode";
import { ConceptActor } from "../../entities/actor";
import { WikiEntityHelper } from "../../entities/wikiEntityHelper";
import { uniqProp } from "../../utils";
import { ActorHelper } from "../../entities/actorHelper";
import { ConceptHelper } from "../../entities/conceptHelper";



export class BuildActor extends UseCase<PopularConceptNode, ConceptActor, void> {

    constructor(private locale: ILocale, private wikiEntityRepository: IWikiEntityReadRepository, private conceptRepository: IConceptReadRepository) {
        super()
    }

    protected async innerExecute(node: PopularConceptNode): Promise<ConceptActor> {

        const wikiEntity = await this.findPerfectWikiEntity(node.topConcepts);

        const nodeConcepts = await this.conceptRepository.getByIds(node.ids);

        let names = nodeConcepts.map(item => item.name);

        if (wikiEntity) {
            names = names.concat(wikiEntity.names);
        }

        names = uniq(names);

        let rootNames = names.map(item => ConceptHelper.rootName(item, this.locale.lang));

        rootNames = uniq(rootNames);

        let rootNamesHashes = rootNames.map(item => ConceptHelper.nameHash(item, this.locale.lang, this.locale.country));

        rootNamesHashes = uniq(rootNamesHashes);

        let allConcepts: Concept[] = []

        for (let nameHash of rootNamesHashes) {
            const concepts = await this.conceptRepository.getByRootNameHash(nameHash);
            allConcepts = allConcepts.concat(concepts);
        }

        allConcepts = uniqProp(allConcepts, 'id');
        allConcepts = allConcepts.sort((a, b) => b.popularity - a.popularity);

        const actor = ActorHelper.create(allConcepts, wikiEntity, node.topConcepts[0]);

        return actor;
    }

    private async findPerfectWikiEntity(concepts: Concept[]): Promise<WikiEntity> {
        const concept = concepts[0];
        let nameHashes = concepts.map(item => WikiEntityHelper.nameHash(item.name, this.locale.lang));
        nameHashes = uniq(nameHashes);

        let entities: WikiEntity[] = []

        for (let nameHash of nameHashes) {
            const list = await this.wikiEntityRepository.getByNameHash(nameHash);
            entities = entities.concat(list);
        }

        if (concept.isAbbr && concept.contextName) {
            if (!entities.find(item => item.countryCode === concept.country)) {
                debug(`finding by contextName: ${concept.contextName}`)
                const list = await this.wikiEntityRepository.getByNameHash(WikiEntityHelper.nameHash(concept.contextName, this.locale.lang));
                debug(`found by contextName: ${list.map(item => JSON.stringify(item))}`);
                entities = entities.concat(list);
            }
        }

        if (entities.length === 0) {
            if (concept.countWords === 1 && !concept.isAbbr) {
                const list = await this.wikiEntityRepository.getByLastName(concept.name, this.locale.lang);
                entities = entities.concat(list);
            }

            if (entities.length === 0) {
                const fullNames = entityFullNames(concept.name, this.locale.country, this.locale.lang);
                if (fullNames && fullNames.length) {
                    nameHashes = fullNames.map(item => WikiEntityHelper.nameHash(item, this.locale.lang));
                    for (let nameHash of nameHashes) {
                        const list = await this.wikiEntityRepository.getByNameHash(nameHash);
                        entities = entities.concat(list);
                    }
                }
            }
        }

        entities = uniqProp(entities, 'id');
        entities = this.sortWikiEntities(entities);

        return entities[0];
    }

    private sortWikiEntities(entities: WikiEntity[]): WikiEntity[] {
        entities = entities.sort((a, b) => b.rank - a.rank);

        const countryEntities = entities.filter(item => item.countryCode === this.locale.country);
        entities = countryEntities.concat(entities);

        return uniq(entities);
    }
}

function entityFullNames(name: string, country: string, lang: string): string[] {

    const countrySuffixes: { [country: string]: { [lang: string]: string[] } } = {
        md: {
            ro: [' din Repoblica Moldova', ' al Republicii Moldova', ' din Moldova'],
        },
    };

    const countryAbbrSuffixes: { [country: string]: { [lang: string]: string[] } } = {
        md: {
            ro: ['RM', 'M'],
        },
    };

    if (NameHelper.isAbbr(name)) {
        if (countryAbbrSuffixes[country] && countryAbbrSuffixes[country][lang]) {
            return countryAbbrSuffixes[country][lang].map(item => name + item);
        }
        return [];
    }

    if (countrySuffixes[country] && countrySuffixes[country][lang]) {
        return countrySuffixes[country][lang].map(item => name + item);
    }

    return [];
}
