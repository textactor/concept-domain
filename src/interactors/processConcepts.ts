
const debug = require('debug')('textactor:concept-domain');

import { UseCase } from '@textactor/domain';
import { IConceptRepository } from './conceptRepository';
import { OnGenerateActorCallback, GenerateActors } from './actions/generateActors';
import { IWikiEntityRepository } from './wikiEntityRepository';
import { SetAbbrConceptsContextName } from './actions/setAbbrConceptsContextName';
import { SetAbbrConceptsLongName } from './actions/setAbbrConceptsLongName';
import { DeleteUnpopularConcepts, DeleteUnpopularConceptsOptions } from './actions/deleteUnpopularConcepts';
import { ExploreWikiEntities } from './actions/exploreWikiEntities';
import { IWikiSearchNameRepository } from './wikiSearchNameRepository';
import { IWikiTitleRepository } from './wikiTitleRepository';
import { IConceptRootNameRepository } from './conceptRootNameRepository';
import { DeleteInvalidConcepts } from './actions/deleteInvalidConcepts';
import { ICountryTagsService } from '..';
import { ConceptContainer, ConceptContainerStatus } from '../entities/conceptContainer';
import { IConceptContainerRepository } from './conceptContainerRepository';
import { ConceptContainerHelper } from '../entities/conceptContainerHelper';
import { PopularConceptNamesEnumerator } from './popularConceptNamesEnumerator';
import { DeleteActorConcepts } from './actions/deleteActorConcepts';
import { CleanConceptContainer } from './actions/cleanConceptContainer';

export interface ProcessConceptsOptions extends DeleteUnpopularConceptsOptions {

}

export class ProcessConcepts extends UseCase<OnGenerateActorCallback, void, ProcessConceptsOptions> {

    constructor(private container: ConceptContainer,
        private containerRep: IConceptContainerRepository,
        private conceptRep: IConceptRepository,
        private rootNameRep: IConceptRootNameRepository,
        private entityRep: IWikiEntityRepository,
        private wikiSearchNameRep: IWikiSearchNameRepository,
        private wikiTitleRep: IWikiTitleRepository,
        private countryTags: ICountryTagsService) {
        super()

        if (!container.lang || !container.country) {
            throw new Error(`ConceptContainer is not valid: ${container.lang}-${container.country}`);
        }
    }

    protected async innerExecute(callback: OnGenerateActorCallback, options: ProcessConceptsOptions): Promise<void> {
        const container = this.container;

        debug(`Start processing concepts... ${JSON.stringify(options)}`);

        if (!ConceptContainerHelper.canStartGenerate(container.status)) {
            return Promise.reject(new Error(`ConceptContainer is not generateable: ${container.status}`));
        }

        const setAbbrConcextName = new SetAbbrConceptsContextName(container, this.conceptRep);
        const setAbbrLongName = new SetAbbrConceptsLongName(container, this.conceptRep);
        const deleteUnpopularConcepts = new DeleteUnpopularConcepts(container, this.conceptRep, this.rootNameRep);
        const deleteInvalidConcepts = new DeleteInvalidConcepts(container, this.conceptRep, this.rootNameRep, this.entityRep);
        const exploreWikiEntities = new ExploreWikiEntities(container,
            new PopularConceptNamesEnumerator({ rootNames: true }, container, this.conceptRep, this.rootNameRep),
            this.entityRep,
            this.wikiSearchNameRep,
            this.wikiTitleRep,
            this.countryTags);
        const generateActors = new GenerateActors(this.container,
            new PopularConceptNamesEnumerator({ rootNames: false }, container, this.conceptRep, this.rootNameRep),
            new DeleteActorConcepts(container, this.conceptRep, this.rootNameRep),
            this.entityRep);
        const cleanContainer = new CleanConceptContainer(this.conceptRep, this.rootNameRep);

        await this.containerRep.update({ item: { id: this.container.id, status: ConceptContainerStatus.GENERATING } });

        try {
            debug(`<===== Start deleteInvalidConcepts`);
            await deleteInvalidConcepts.execute(null);
            debug(`<===== End deleteInvalidConcepts`);

            debug(`=====> Start setAbbrLongName`);
            const setAbbrLongNameMap = await setAbbrLongName.execute(null);
            debug(`setAbbrLongNameMap=${JSON.stringify(setAbbrLongNameMap)}`);
            debug(`<===== End setAbbrLongName`);
            debug(`=====> Start setAbbrConcextName`);
            const setAbbrContextNameMap = await setAbbrConcextName.execute(null);
            debug(`setAbbrContextNameMap=${JSON.stringify(setAbbrContextNameMap)}`);
            debug(`<===== End setAbbrConcextName`);
            debug(`=====> Start deleteUnpopularConcepts`);
            await deleteUnpopularConcepts.execute(options);
            debug(`<===== End deleteUnpopularConcepts`);

            debug(`=====> Start exploreWikiEntities`);
            await exploreWikiEntities.execute(null);
            debug(`<===== End exploreWikiEntities`);

            debug(`<===== Start deleteInvalidConcepts`);
            await deleteInvalidConcepts.execute(null);
            debug(`<===== End deleteInvalidConcepts`);

            debug(`=====> Start generateActors`);
            await generateActors.execute(callback);
            debug(`<===== End generateActors`);
            await cleanContainer.execute(container);

        } catch (e) {
            const error = e.message;
            await this.containerRep.update({
                item: {
                    id: this.container.id, status: ConceptContainerStatus.GENERATE_ERROR,
                    lastError: error
                }
            });
            throw e;
        }

        await this.containerRep.update({ item: { id: this.container.id, status: ConceptContainerStatus.EMPTY } });
    }
}
