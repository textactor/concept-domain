
const debug = require('debug')('textactor:concept-domain');

import { UseCase, uniq, seriesPromise } from '@textactor/domain';
import { IConceptReadRepository } from '../conceptRepository';
import { Locale } from '../../types';
import { IWikiEntityRepository } from '../wikiEntityRepository';
import { ExploreWikiEntitiesByTitles } from './exploreWikiEntitiesByTitles';
import { SaveWikiEntities } from './saveWikiEntities';
import { FindWikiTitles } from './findWikiTitles';
import { WikiEntity } from '../../entities/wikiEntity';
import { IWikiSearchNameRepository } from '../wikiSearchNameRepository';
import { WikiSearchNameHelper } from '../../entities/wikiSearchName';
import { IWikiTitleRepository } from '../wikiTitleRepository';
import { WikiTitleHelper } from '../../entities/wikiTitle';
const ms = require('ms');

export type ExploreWikiEntitiesResults = {
    countProcessedNames: number
    countExistingEntities: number
    countNewEntities: number
    lastnames: string[]
}

export class ExploreWikiEntities extends UseCase<void, ExploreWikiEntitiesResults, void> {
    private exploreWikiEntitiesByTitles: ExploreWikiEntitiesByTitles;
    private saveWikiEntities: SaveWikiEntities;
    private findWikiTitles: FindWikiTitles;

    constructor(private locale: Locale,
        private conceptRepository: IConceptReadRepository,
        wikiEntityRepository: IWikiEntityRepository,
        private wikiSearchNameRepository: IWikiSearchNameRepository,
        private wikiTitleRepository: IWikiTitleRepository) {
        super()

        this.exploreWikiEntitiesByTitles = new ExploreWikiEntitiesByTitles(locale);
        this.saveWikiEntities = new SaveWikiEntities(wikiEntityRepository);
        this.findWikiTitles = new FindWikiTitles(locale);
    }

    protected async innerExecute(): Promise<ExploreWikiEntitiesResults> {
        let skip = 0;
        const limit = 100;
        const self = this;

        const results: ExploreWikiEntitiesResults = {
            countExistingEntities: 0,
            countNewEntities: 0,
            countProcessedNames: 0,
            lastnames: []
        };

        async function start(): Promise<void> {

            const hashes = await self.conceptRepository.getPopularRootNameHashes(self.locale, limit, skip);

            if (hashes.length === 0) {
                debug(`concepts hashes==0`);
                return;
            }
            skip += limit;

            let ids = hashes.reduce<string[]>((list, hash) => list.concat(hash.ids.splice(0, 2)), []);
            ids = uniq(ids);

            // debug(`hashes ids: ${ids}`);

            const concepts = await self.conceptRepository.getByIds(ids);
            let names: string[] = [];
            for (let concept of concepts) {
                names.push(concept.name);
                // names.push(NameHelper.rootName(concept.name, lang));
                if (concept.isAbbr) {
                    if (concept.abbrLongNames) {
                        names = names.concat(concept.abbrLongNames);
                    }
                    if (concept.contextNames) {
                        names = names.concat(concept.contextNames);
                    }
                    // names.push(ConceptHelper.rootName(concept.contextName, lang));
                }
            }
            names = uniq(names);

            debug(`exploring wiki entity by names: ${names}`);

            await seriesPromise(names, name => {
                return self.processName(name, results)
                    .then(entities => {
                        if (entities.length) {
                            results.lastnames = results.lastnames.concat(entities.map(item => item.lastname)
                                .filter(item => !!item));
                        }
                    });
            });

            results.countProcessedNames += names.length;

            await start();
        }

        await start();

        results.lastnames = uniq(results.lastnames);

        return results;
    }

    private async processName(name: string, results: ExploreWikiEntitiesResults): Promise<WikiEntity[]> {
        const lang = this.locale.lang;
        const country = this.locale.country;

        const searchName = await this.wikiSearchNameRepository.getById(WikiSearchNameHelper.createId(name, lang, country));
        if (searchName && searchName.lastSearchAt.getTime() > Date.now() - ms('30days')) {
            debug(`WikiSearchName=${name} exists!`);
            return [];
        }

        await this.wikiSearchNameRepository.createOrUpdate(WikiSearchNameHelper.create({
            name,
            lang,
            country,
            foundTitles: [],
        }));

        let initalTitles = await this.findWikiTitles.execute([name]);
        if (!initalTitles.length) {
            return [];
        }

        initalTitles = uniq(initalTitles);
        const titles: string[] = [];

        await seriesPromise(initalTitles, async title => {
            const wikiTitle = await this.wikiTitleRepository.getById(WikiTitleHelper.createId(title, lang));
            if (wikiTitle && wikiTitle.lastSearchAt.getTime() > Date.now() - ms('30days')) {
                debug(`WikiTitle=${title} exists!`);
                return;
            }
            titles.push(title);
        });

        if (titles.length === 0) {
            return [];
        }

        const wikiEntities = await this.exploreWikiEntitiesByTitles.execute(titles);

        results.countNewEntities += wikiEntities.length;

        debug(`found wiki entities for ${name}==${wikiEntities.length}`);
        await this.saveWikiEntities.execute(wikiEntities);

        await seriesPromise(titles, async title => {
            await this.wikiTitleRepository.createOrUpdate(WikiTitleHelper.create({
                title,
                lang,
            }));
        });

        return wikiEntities;
    }
}
