
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
import { IConceptRootNameRepository } from './conceptRootNameRepository';
import { DeleteInvalidConcepts } from './actions/deleteInvalidConcepts';
import { ICountryTagsService } from '..';

export interface ProcessConceptsOptions extends DeleteUnpopularConceptsOptions {

}

export class ProcessConcepts extends UseCase<OnGenerateActorCallback, void, ProcessConceptsOptions> {
    constructor(private locale: Locale,
        private conceptRepository: IConceptRepository,
        private rootNameRep: IConceptRootNameRepository,
        private entityRepository: IWikiEntityRepository,
        private wikiSearchNameRepository: IWikiSearchNameRepository,
        private wikiTitleRepository: IWikiTitleRepository,
        private countryTags: ICountryTagsService) {
        super()
    }

    protected async innerExecute(callback: OnGenerateActorCallback, options: ProcessConceptsOptions): Promise<void> {
        const locale = this.locale;

        debug(`Start processing concepts... ${JSON.stringify(options)}`);

        const setAbbrConcextName = new SetAbbrConceptsContextName(locale, this.conceptRepository);
        const setAbbrLongName = new SetAbbrConceptsLongName(locale, this.conceptRepository);
        const deleteUnpopularConcepts = new DeleteUnpopularConcepts(locale, this.conceptRepository, this.rootNameRep);
        // const deletePartialConcepts = new DeletePartialConcepts(locale, this.conceptRepository, this.rootNameRep, this.entityRepository);
        const deleteInvalidConcepts = new DeleteInvalidConcepts(locale, this.conceptRepository, this.rootNameRep, this.entityRepository);
        const exploreWikiEntities = new ExploreWikiEntities(locale,
            this.conceptRepository,
            this.rootNameRep,
            this.entityRepository,
            this.wikiSearchNameRepository,
            this.wikiTitleRepository,
            this.countryTags);
        const generateActors = new GenerateActors(locale,
            this.conceptRepository,
            this.rootNameRep,
            this.entityRepository);

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
    }
}
