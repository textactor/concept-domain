import { ILocale } from "../../types";
import { IConceptRepository, PopularConceptHash } from "../conceptRepository";
import { IWikiEntity } from "../../entities/wikiEntity";
import { IWikiEntityRepository } from "../wikiEntityRepository";
import { IConcept } from "../..";
import { WikiEntityHelper } from "../../entities/wikiEntityHelper";
import { getEntities as getWikiDataEntities } from 'wiki-entity';

export interface IActorsGenerator {
    next(): Promise<string>
}

export type Repositories = {
    concept: IConceptRepository,
    wikiEntity: IWikiEntityRepository,
}

export interface ActorsGeneratorOptions {
    limit?: number
}

export class ActorsGenerator implements IActorsGenerator {
    private ended = false;
    private nextExecuting = false;
    // private limit = 50;
    // private offset = 0;
    constructor(private locale: ILocale, private repos: Repositories) {

    }

    next(): Promise<string> {
        if (this.ended) {
            return Promise.reject(new Error(`Generator is expired`));
        }

        if (this.nextExecuting) {
            return Promise.reject(new Error(`Waiting for previous executing...`));
        }

        this.nextExecuting = true;

        return this.repos.concept.getPopularRootTextHashes(this.locale, 1)
            .then(popularConceptHashes => {
                if (!popularConceptHashes || !popularConceptHashes.length) {
                    return this.onEnd()
                }
                return this.getWikiEntity(popularConceptHashes[0]);
            })
    }

    private getWikiEntity(popularConceptHashe: PopularConceptHash): Promise<IWikiEntity> {
        return this.repos.concept.getByIds(popularConceptHashe.ids)
            .then(concepts => {

            })
    }

    private exploreWikiEntity(concept: IConcept) {
        return this.repos.wikiEntity.getByNameHash(WikiEntityHelper.nameHash(concept.text, concept.lang))
            .then(entities => {
                if (entities && entities.length) {
                    entities = entities.sort((a, b) => b.rank - a.rank);
                    const countryEntity = entities.find(a => a.countryCode === concept.country);
                    if (countryEntity) {
                        return countryEntity;
                    }
                    // most ranked entity
                    return entities[0];
                }
                return getWikiDataEntities({
                    language: concept.lang,
                    titles: concept.text,
                    redirects: true,
                    props: 'info|sitelinks|aliases|labels|descriptions|claims|datatype',
                    claims: 'item',
                    extract: 3,
                    types: true,
                    categories: true,
                })
            });
    }

    private onEnd() {
        this.ended = true;
        this.nextExecuting = false;
        return Promise.resolve(null);
    }
}
