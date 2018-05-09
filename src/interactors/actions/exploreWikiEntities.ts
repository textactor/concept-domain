
const debug = require('debug')('textactor:concept-domain');

import { UseCase, uniq, seriesPromise } from '@textactor/domain';
import { IConceptReadRepository } from '../conceptRepository';
import { Locale } from '../../types';
import { IWikiEntityRepository } from '../wikiEntityRepository';
import { ExploreWikiEntitiesByTitles } from './exploreWikiEntitiesByTitles';
import { SaveWikiEntities } from './saveWikiEntities';
import { FindWikiTitles, ICountryTagsService } from './findWikiTitles';
import { WikiEntity } from '../../entities/wikiEntity';
import { IWikiSearchNameRepository } from '../wikiSearchNameRepository';
import { WikiSearchNameHelper } from '../../entities/wikiSearchName';
import { IWikiTitleRepository } from '../wikiTitleRepository';
import { WikiTitleHelper } from '../../entities/wikiTitle';
import { ConceptHelper } from '../..';
import { IConceptRootNameRepository } from '../conceptRootNameRepository';
import { ConceptContainer } from '../../entities/conceptContainer';
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

    constructor(private container: ConceptContainer,
        private conceptRep: IConceptReadRepository,
        private rootNameRep: IConceptRootNameRepository,
        entityRep: IWikiEntityRepository,
        private wikiSearchNameRep: IWikiSearchNameRepository,
        private wikiTitleRep: IWikiTitleRepository,
        countryTags: ICountryTagsService) {
        super()

        const locale: Locale = {
            lang: container.lang,
            country: container.country,
        };

        this.exploreWikiEntitiesByTitles = new ExploreWikiEntitiesByTitles(locale);
        this.saveWikiEntities = new SaveWikiEntities(entityRep);
        this.findWikiTitles = new FindWikiTitles(locale, countryTags);
    }

    protected async innerExecute(): Promise<ExploreWikiEntitiesResults> {
        let skip = 0;
        const limit = 10;
        const self = this;

        const results: ExploreWikiEntitiesResults = {
            countExistingEntities: 0,
            countNewEntities: 0,
            countProcessedNames: 0,
        };

        async function start(): Promise<void> {

            const rootIds = await self.rootNameRep.getMostPopularIds(self.container.id, limit, skip);

            if (rootIds.length === 0) {
                debug(`concepts rootIds==0`);
                return;
            }
            skip += limit;

            const concepts = await self.conceptRep.getByRootNameIds(rootIds);
            const names: string[] = ConceptHelper.getConceptsNames(concepts, true);

            debug(`exploring wiki entity by names: ${names}`);

            await seriesPromise(names, name => self.processName(name, results));

            results.countProcessedNames += names.length;

            await start();
        }

        await start();

        return results;
    }

    private async processName(name: string, results: ExploreWikiEntitiesResults): Promise<WikiEntity[]> {
        const lang = this.container.lang;
        const country = this.container.country;

        const searchName = await this.wikiSearchNameRep.getById(WikiSearchNameHelper.createId(name, lang, country));
        if (searchName && searchName.updatedAt * 1000 > Date.now() - ms('7days')) {
            debug(`WikiSearchName=${name} exists!`);
            return [];
        }

        await this.wikiSearchNameRep.createOrUpdate(WikiSearchNameHelper.create({
            name,
            lang,
            country,
        }));

        let initalTitles = await this.findWikiTitles.execute([name]);
        if (!initalTitles.length) {
            return [];
        }

        initalTitles = uniq(initalTitles);
        const titles: string[] = [];

        await seriesPromise(initalTitles, async title => {
            const wikiTitle = await this.wikiTitleRep.getById(WikiTitleHelper.createId(title, lang));
            if (wikiTitle && wikiTitle.updatedAt * 1000 > Date.now() - ms('10days')) {
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

        if (wikiEntities.length) {
            debug(`found wiki entities for ${name}==${wikiEntities.length}`);
            await this.saveWikiEntities.execute(wikiEntities);
        } else {
            debug(`Not found wiki entities for ${name}`);
        }

        await seriesPromise(titles, title => this.wikiTitleRep.createOrUpdate(WikiTitleHelper.create({ title, lang, })));

        return wikiEntities;
    }
}
