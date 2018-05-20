
const debug = require('debug')('textactor:concept-domain');

import { UseCase, uniq, seriesPromise } from '@textactor/domain';
import { Locale } from '../../types';
import { IWikiEntityRepository } from '../wikiEntityRepository';
import { FindWikiEntitiesByTitles } from './findWikiEntitiesByTitles';
import { SaveWikiEntities } from './saveWikiEntities';
import { FindWikiTitles, ICountryTagsService } from './findWikiTitles';
import { IWikiSearchNameRepository } from '../wikiSearchNameRepository';
import { WikiSearchNameHelper } from '../../entities/wikiSearchName';
import { IWikiTitleRepository } from '../wikiTitleRepository';
import { WikiTitleHelper } from '../../entities/wikiTitle';
import { ConceptContainer } from '../../entities/conceptContainer';
const ms = require('ms');

export class ExploreWikiEntitiesByNames extends UseCase<string[], void, void> {
    private exploreWikiEntitiesByTitles: FindWikiEntitiesByTitles;
    private saveWikiEntities: SaveWikiEntities;
    private findWikiTitles: FindWikiTitles;

    constructor(private container: ConceptContainer,
        entityRep: IWikiEntityRepository,
        private wikiSearchNameRep: IWikiSearchNameRepository,
        private wikiTitleRep: IWikiTitleRepository,
        countryTags: ICountryTagsService) {
        super()

        const locale: Locale = {
            lang: container.lang,
            country: container.country,
        };

        this.exploreWikiEntitiesByTitles = new FindWikiEntitiesByTitles(locale);
        this.saveWikiEntities = new SaveWikiEntities(entityRep);
        this.findWikiTitles = new FindWikiTitles(locale, countryTags);
    }

    protected async innerExecute(names: string[]): Promise<void> {
        const lang = this.container.lang;
        const country = this.container.country;

        const unknownNames: string[] = []

        await seriesPromise(names, async name => {
            const searchName = await this.wikiSearchNameRep.getById(WikiSearchNameHelper.createId(name, lang, country));
            if (searchName && searchName.updatedAt * 1000 > Date.now() - ms('7days')) {
                debug(`WikiSearchName=${name} exists!`);
                return;
            }

            unknownNames.push(name);

            await this.wikiSearchNameRep.createOrUpdate(WikiSearchNameHelper.create({
                name,
                lang,
                country,
            }));
        });

        if (unknownNames.length === 0) {
            return;
        }

        let initalTitles = await this.findWikiTitles.execute(unknownNames);
        if (!initalTitles.length) {
            return;
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
            return;
        }

        const wikiEntities = await this.exploreWikiEntitiesByTitles.execute(titles);

        if (wikiEntities.length) {
            debug(`found wiki entities for ${names[0]}==${wikiEntities.length}`);
            await this.saveWikiEntities.execute(wikiEntities);
        } else {
            debug(`Not found wiki entities for ${names[0]}`);
        }

        await seriesPromise(titles, title => this.wikiTitleRep.createOrUpdate(WikiTitleHelper.create({ title, lang, })));
    }
}
