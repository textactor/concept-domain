
const debug = require('debug')('textactor:concept-domain');

import { UseCase, uniq } from "@textactor/domain";
import { Locale } from "../../types";
import { IConceptRepository } from "../conceptRepository";
import { IWikiEntityRepository } from "../wikiEntityRepository";
import { ConceptHelper } from '../../entities/conceptHelper';
import { RootNameHelper, IConceptRootNameRepository } from "../..";

export class DeleteInvalidConcepts extends UseCase<void, void, void> {

    constructor(private locale: Locale,
        private conceptRep: IConceptRepository,
        private rootNameRep: IConceptRootNameRepository,
        private wikiEntityRep: IWikiEntityRepository) {
        super()
    }

    protected async innerExecute(): Promise<void> {
        const lang = this.locale.lang;
        const country = this.locale.country;
        const invalidNames = await this.wikiEntityRep.getInvalidPartialNames(lang);
        debug(`Deleting invalid names: ${JSON.stringify(invalidNames)}`);

        const invalidNamesIds = uniq(invalidNames.map(item => ConceptHelper.id(item, lang, country)));
        const invalidNamesRootIds = uniq(invalidNames.map(item => RootNameHelper.idFromName(item, lang, country)));

        await this.conceptRep.deleteIds(invalidNamesIds);
        await this.conceptRep.deleteByRootNameIds(invalidNamesRootIds);
        await this.rootNameRep.deleteIds(invalidNamesRootIds);
    }
}