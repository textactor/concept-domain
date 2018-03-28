
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

    protected async innerExecute(callback: OnGenerateActorCallback, options?: ProcessConceptsOptions): Promise<void> {
        const locale = this.locale;

        const setAbbrConcextName = new SetAbbrConceptsContextName(locale, this.conceptRepository);
        const setAbbrLongName = new SetAbbrConceptsLongName(locale, this.conceptRepository);
        const deleteUnpopularConcepts = new DeleteUnpopularConcepts(locale, this.conceptRepository);
        const exploreWikiEntities = new ExploreWikiEntities(locale, this.conceptRepository, this.entityRepository);
        const generateActors = new GenerateActors(locale, this.conceptRepository, this.entityRepository);

        await setAbbrLongName.execute(null);
        await setAbbrConcextName.execute(null);
        await deleteUnpopularConcepts.execute(options);

        const wikiExploreResults = await exploreWikiEntities.execute(null);
        const lastnamesHashes = uniq(wikiExploreResults.lastnames.map(name => ConceptHelper.nameHash(name, locale.lang, locale.country)));

        await this.conceptRepository.deleteByNameHash(lastnamesHashes);

        await generateActors.execute(callback);
    }
}

