
const debug = require('debug')('textactor:concept-domain');

import { UseCase, uniq } from "@textactor/domain";
import { IConceptRepository } from "../conceptRepository";
import { Locale } from "../../types";
import { ConceptHelper } from "../../entities/conceptHelper";
import { IWikiEntityReadRepository } from "../wikiEntityRepository";


export class DeletePartialConcepts extends UseCase<void, void, void> {

    constructor(private locale: Locale, private conceptRepository: IConceptRepository, private entityRepository: IWikiEntityReadRepository) {
        super()
    }

    protected async innerExecute(): Promise<void> {
        const { lang, country } = this.locale;
        const lastnames = await this.entityRepository.getLastnames(lang);
        const lastnamesHashes = uniq(lastnames.map(name => ConceptHelper.nameHash(ConceptHelper.rootName(name, lang), lang, country)));
        await this.conceptRepository.deleteByRootNameHash(lastnamesHashes);
        debug(`Deleted lastnames=${JSON.stringify(lastnames)}`);
    }
}
