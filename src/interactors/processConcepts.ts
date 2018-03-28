
const debug = require('debug')('textactor:concept-domain');

import { UseCase, uniq } from '@textactor/domain';
import { IConceptRepository } from './conceptRepository';
import { ConceptHelper } from '../entities/conceptHelper';
import { Locale } from '../types';
import { OnGenerateActorCallback, GenerateActors } from './actions/generateActors';
import { IWikiEntityRepository } from './wikiEntityRepository';
import { SetAbbrConceptsContextName } from './actions/setAbbrConceptsContextName';
import { SetAbbrConceptsLongName } from './actions/setAbbrConceptsLongName';
import { DeleteUnpopularConcepts, DeleteUnpopularConceptsOptions } from './actions/deleteUnpopularConcepts';
import { ExploreWikiEntities } from './actions/exploreWikiEntities';

export interface ProcessConceptsOptions extends DeleteUnpopularConceptsOptions {

}

export class ProcessConcepts extends UseCase<OnGenerateActorCallback, void, ProcessConceptsOptions> {
    private locale: Locale;

    constructor(locale: Locale, private conceptRepository: IConceptRepository, private entityRepository: IWikiEntityRepository) {
        super()
        this.locale = { ...locale };
    }

    protected async innerExecute(callback: OnGenerateActorCallback, options: ProcessConceptsOptions): Promise<void> {
        const locale = this.locale;

        debug(`Start processing concepts... ${JSON.stringify(options)}`);

        const setAbbrConcextName = new SetAbbrConceptsContextName(locale, this.conceptRepository);
        const setAbbrLongName = new SetAbbrConceptsLongName(locale, this.conceptRepository);
        const deleteUnpopularConcepts = new DeleteUnpopularConcepts(locale, this.conceptRepository);
        const exploreWikiEntities = new ExploreWikiEntities(locale, this.conceptRepository, this.entityRepository);
        const generateActors = new GenerateActors(locale, this.conceptRepository, this.entityRepository);

        debug(`=====> Start setAbbrLongName`);
        await setAbbrLongName.execute(null);
        debug(`<===== End setAbbrLongName`);
        debug(`=====> Start setAbbrConcextName`);
        await setAbbrConcextName.execute(null);
        debug(`<===== End setAbbrConcextName`);
        debug(`=====> Start deleteUnpopularConcepts`);
        await deleteUnpopularConcepts.execute(options);
        debug(`<===== End deleteUnpopularConcepts`);

        debug(`=====> Start exploreWikiEntities`);
        const wikiExploreResults = await exploreWikiEntities.execute(null);
        debug(`<===== End exploreWikiEntities`);
        const lastnamesHashes = uniq(wikiExploreResults.lastnames.map(name => ConceptHelper.nameHash(name, locale.lang, locale.country)));

        debug(`=====> Start deleteByNameHash`);
        await this.conceptRepository.deleteByNameHash(lastnamesHashes);
        debug(`<===== End deleteByNameHash`);

        debug(`=====> Start generateActors`);
        await generateActors.execute(callback);
        debug(`<===== End generateActors`);
    }
}

