
const debug = require('debug')('textactor:concept-domain');

import { UseCase, uniq, seriesPromise } from '@textactor/domain';
import { IConceptReadRepository } from './conceptRepository';
import { Locale } from '../types';
import { ExploreWikiEntitiesByTitles, SaveWikiEntities, FindWikiTitles } from './actions';
import { IWikiEntityRepository } from './wikiEntityRepository';
import { WikiEntityHelper } from '../entities/wikiEntityHelper';
import { WikiEntity } from '../entities';

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

    constructor(private locale: Locale, private conceptRepository: IConceptReadRepository,
        private wikiEntityRepository: IWikiEntityRepository) {
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

            debug(`hashes ids: ${ids}`);

            const concepts = await self.conceptRepository.getByIds(ids);
            let names: string[] = [];
            for (let concept of concepts) {
                names.push(concept.name);
                if (concept.isAbbr && concept.contextName) {
                    debug(`exploring wiki entity by context name: ${concept.contextName}`);
                    names.push(concept.contextName);
                }
            }
            names = uniq(names);

            await seriesPromise(names, name => {
                return self.processName(name, self.locale.lang, results)
                    .then(entities => {
                        results.lastnames = results.lastnames.concat(entities.map(item => item.lastname)
                            .filter(item => !!item));
                    });
            });

            results.countProcessedNames += names.length;

            await start();
        }

        await start();

        results.lastnames = uniq(results.lastnames);

        return results;
    }

    private async processName(name: string, lang: string, results: ExploreWikiEntitiesResults): Promise<WikiEntity[]> {
        const existingWikiEntities = await this.wikiEntityRepository.getByNameHash(WikiEntityHelper.nameHash(name, lang));
        if (existingWikiEntities.length) {
            results.countExistingEntities += existingWikiEntities.length;
            debug(`WikiEntity exists name=${name}`);
            return existingWikiEntities;
        }
        const titles = await this.findWikiTitles.execute([name]);
        if (!titles.length) {
            return [];
        }

        const wikiEntities = await this.exploreWikiEntitiesByTitles.execute(titles);

        if (!wikiEntities.length) {
            return [];
        }

        results.countNewEntities += wikiEntities.length;

        debug(`found wiki entities for ${name}==${wikiEntities.length}`);
        await this.saveWikiEntities.execute(wikiEntities);
        return wikiEntities;
    }
}
