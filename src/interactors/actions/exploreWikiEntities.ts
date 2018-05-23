
const debug = require('debug')('textactor:concept-domain');

import { UseCase } from '@textactor/domain';
import { IWikiEntityRepository } from '../wikiEntityRepository';
import { ICountryTagsService } from './findWikiTitles';
import { IWikiSearchNameRepository } from '../wikiSearchNameRepository';
import { IWikiTitleRepository } from '../wikiTitleRepository';
import { ConceptContainer } from '../../entities/conceptContainer';
import { INamesEnumerator } from '../namesEnumerator';
import { ExploreWikiEntitiesByNames } from './exploreWikiEntitiesByNames';


export class ExploreWikiEntities extends UseCase<void, void, void> {
    private exploreByNames: ExploreWikiEntitiesByNames;

    constructor(container: ConceptContainer,
        private namesEnumerator: INamesEnumerator,
        entityRep: IWikiEntityRepository,
        wikiSearchNameRep: IWikiSearchNameRepository,
        wikiTitleRep: IWikiTitleRepository,
        countryTags: ICountryTagsService) {
        super()

        this.exploreByNames = new ExploreWikiEntitiesByNames(container, entityRep, wikiSearchNameRep, wikiTitleRep, countryTags);
    }

    protected async innerExecute(): Promise<void> {
        const self = this;

        async function start(): Promise<void> {
            const names = await self.namesEnumerator.next();
            if (names && names.length) {
                debug(`exploring wiki entity by names: ${names}`);

                await self.exploreByNames.execute(names);
            }

            if (!self.namesEnumerator.atEnd()) {
                await start();
            }
        }

        await start();
    }
}
