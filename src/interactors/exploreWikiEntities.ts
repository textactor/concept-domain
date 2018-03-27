
const debug = require('debug')('textactor:concept-domain');

import { UseCase, uniq, seriesPromise } from '@textactor/domain';
import { IConceptReadRepository } from './conceptRepository';
import { Locale } from '../types';
import { ExploreWikiEntitiesByTitles, SaveWikiEntities, FindWikiTitles } from './actions';
import { IWikiEntityRepository } from './wikiEntityRepository';
import { WikiEntityHelper } from '../entities/wikiEntityHelper';

export class ExploreWikiEntities extends UseCase<void, void, void> {
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

    protected async innerExecute(): Promise<void> {
        let skip = 0;
        const limit = 100;
        const self = this;

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
                if (concept.contextName) {
                    debug(`exploring wiki entity by context name: ${concept.contextName}`);
                    names.push(concept.contextName);
                }
            }
            names = uniq(names);
            await seriesPromise(names, name => self.processName(name, self.locale.lang));

            await start();
        }

        await start();
    }

    private async processName(name: string, lang: string): Promise<boolean> {
        const existingWikiEntities = await this.wikiEntityRepository.getByNameHash(WikiEntityHelper.nameHash(name, lang));
        if (existingWikiEntities.length) {
            debug(`WikiEntity exists name=${name}`);
            return true;
        }
        const titles = await this.findWikiTitles.execute([name]);
        if (!titles.length) {
            return false;
        }

        const wikiEntities = await this.exploreWikiEntitiesByTitles.execute(titles);

        if (!wikiEntities.length) {
            return false;
        }

        debug(`found wiki entities for ${name}==${wikiEntities.length}`);
        await this.saveWikiEntities.execute(wikiEntities);
        return true;
    }
}
