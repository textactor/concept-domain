
const debug = require('debug')('textactor:concept-domain');

import { UseCase } from '@textactor/domain';
import { IConceptRepository } from './conceptRepository';
import { Locale } from '../types';
import { OnGenerateActorCallback, GenerateActors } from './actions/generateActors';
import { IWikiEntityRepository } from './wikiEntityRepository';
import { SetAbbrConceptsContextName } from './actions/setAbbrConceptsContextName';
import { SetAbbrConceptsLongName } from './actions/setAbbrConceptsLongName';
import { DeleteUnpopularConcepts, DeleteUnpopularConceptsOptions } from './actions/deleteUnpopularConcepts';
import { ExploreWikiEntities } from './actions/exploreWikiEntities';
import { IWikiSearchNameRepository } from './wikiSearchNameRepository';
import { IWikiTitleRepository } from './wikiTitleRepository';
import { DeletePartialConcepts } from './actions/deletePartialConcepts';

export interface ProcessConceptsOptions extends DeleteUnpopularConceptsOptions {

}

export class ProcessConcepts extends UseCase<OnGenerateActorCallback, void, ProcessConceptsOptions> {
    private locale: Locale;

    constructor(locale: Locale,
        private conceptRepository: IConceptRepository,
        private entityRepository: IWikiEntityRepository,
        private wikiSearchNameRepository: IWikiSearchNameRepository,
        private wikiTitleRepository: IWikiTitleRepository) {
        super()
        this.locale = { ...locale };
    }

    protected async innerExecute(callback: OnGenerateActorCallback, options: ProcessConceptsOptions): Promise<void> {
        const locale = this.locale;

        debug(`Start processing concepts... ${JSON.stringify(options)}`);

        const setAbbrConcextName = new SetAbbrConceptsContextName(locale, this.conceptRepository);
        const setAbbrLongName = new SetAbbrConceptsLongName(locale, this.conceptRepository);
        const deleteUnpopularConcepts = new DeleteUnpopularConcepts(locale, this.conceptRepository);
        const deletePartialConcepts = new DeletePartialConcepts(locale, this.conceptRepository, this.entityRepository);
        const exploreWikiEntities = new ExploreWikiEntities(locale,
            this.conceptRepository,
            this.entityRepository,
            this.wikiSearchNameRepository,
            this.wikiTitleRepository);
        const generateActors = new GenerateActors(locale,
            this.conceptRepository,
            this.entityRepository);

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

        debug(`<===== Start deletePartialConcepts`);
        await deletePartialConcepts.execute(null);
        debug(`<===== End deletePartialConcepts`);

        debug(`=====> Start generateActors`);
        await generateActors.execute(callback);
        debug(`<===== End generateActors`);
    }
}
