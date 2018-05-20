
const debug = require('debug')('textactor:concept-domain');

import { UseCase } from '@textactor/domain';
import { IWikiEntityRepository } from './wikiEntityRepository';
import { IWikiSearchNameRepository } from './wikiSearchNameRepository';
import { IWikiTitleRepository } from './wikiTitleRepository';
import { ICountryTagsService, ConceptActor } from '..';
import { ConceptContainer } from '../entities/conceptContainer';
import { ExploreWikiEntitiesByNames } from './actions/exploreWikiEntitiesByNames';
import { BuildActorByNames } from './actions/buildActorByNames';

export class ProcessName extends UseCase<string, ConceptActor, void> {

    constructor(private container: ConceptContainer,
        private entityRep: IWikiEntityRepository,
        private wikiSearchNameRep: IWikiSearchNameRepository,
        private wikiTitleRep: IWikiTitleRepository,
        private countryTags: ICountryTagsService) {
        super()

        if (!container.lang || !container.country) {
            throw new Error(`ConceptContainer is not valid: ${container.lang}-${container.country}`);
        }
    }

    protected async innerExecute(name: string): Promise<ConceptActor> {
        const container = this.container;

        debug(`Start processing name: ${name}`);

        const exploreWikiEntities = new ExploreWikiEntitiesByNames(container,
            this.entityRep,
            this.wikiSearchNameRep,
            this.wikiTitleRep,
            this.countryTags);
        const buildActor = new BuildActorByNames(this.container, this.entityRep);

        debug(`=====> Start exploreWikiEntities`);
        await exploreWikiEntities.execute([name]);
        debug(`<===== End exploreWikiEntities`);

        debug(`=====> Start generateActors`);
        const actor = await buildActor.execute([name]);
        debug(`<===== End generateActors`);

        debug(`End processing name: ${name}`);

        return actor;
    }
}
