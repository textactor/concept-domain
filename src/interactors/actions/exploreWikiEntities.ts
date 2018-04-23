
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
import { ConceptHelper } from '../..';
import { IConceptRootNameRepository } from '../conceptRootNameRepository';
const ms = require('ms');

export type ExploreWikiEntitiesResults = {
    countProcessedNames: number
    countExistingEntities: number
    countNewEntities: number
}

export class ExploreWikiEntities extends UseCase<void, ExploreWikiEntitiesResults, void> {
    private exploreWikiEntitiesByTitles: ExploreWikiEntitiesByTitles;
    private saveWikiEntities: SaveWikiEntities;
    private findWikiTitles: FindWikiTitles;

    constructor(private locale: Locale,
        private conceptRep: IConceptReadRepository,
        private rootNameRep: IConceptRootNameRepository,
        entityRep: IWikiEntityRepository,
        private wikiSearchNameRep: IWikiSearchNameRepository,
        private wikiTitleRep: IWikiTitleRepository) {
        super()

        this.exploreWikiEntitiesByTitles = new ExploreWikiEntitiesByTitles(locale);
        this.saveWikiEntities = new SaveWikiEntities(entityRep);
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
        };

        async function start(): Promise<void> {

            const rootIds = await self.rootNameRep.getMostPopularIds(self.locale, limit, skip);

            if (rootIds.length === 0) {
                debug(`concepts rootIds==0`);
                return;
            }
            skip += limit;

            const concepts = await self.conceptRep.getByRootNameIds(rootIds);
            const names: string[] = ConceptHelper.getConceptsNames(concepts, true);

            debug(`exploring wiki entity by names: ${names}`);

            await seriesPromise(names, name => {
                return self.processName(name, results);
            });

            results.countProcessedNames += names.length;

            await start();
        }

        await start();

        return results;
    }

    private async processName(name: string, results: ExploreWikiEntitiesResults): Promise<WikiEntity[]> {
        const lang = this.locale.lang;
        const country = this.locale.country;

        const searchName = await this.wikiSearchNameRep.getById(WikiSearchNameHelper.createId(name, lang, country));
        if (searchName && searchName.lastSearchAt * 1000 > Date.now() - ms('30days')) {
            debug(`WikiSearchName=${name} exists!`);
            return [];
        }

        await this.wikiSearchNameRep.createOrUpdate(WikiSearchNameHelper.create({
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
            const wikiTitle = await this.wikiTitleRep.getById(WikiTitleHelper.createId(title, lang));
            if (wikiTitle && wikiTitle.lastSearchAt * 1000 > Date.now() - ms('30days')) {
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
            await this.wikiTitleRep.createOrUpdate(WikiTitleHelper.create({
                title,
                lang,
            }));
        });

        return wikiEntities;
    }
}
