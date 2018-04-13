
const debug = require('debug')('textactor:concept-domain');

import { UseCase, uniq } from "@textactor/domain";
import { IConceptRepository } from "../conceptRepository";
import { Locale } from "../../types";
import { IWikiEntityReadRepository } from "../wikiEntityRepository";
import { IConceptRootNameWriteRepository } from "../conceptRootNameRepository";
import { RootNameHelper } from "../../entities/rootNameHelper";


export class DeletePartialConcepts extends UseCase<void, void, void> {

    constructor(private locale: Locale,
        private conceptRep: IConceptRepository,
        private rootNameRep: IConceptRootNameWriteRepository,
        private entityRep: IWikiEntityReadRepository) {
        super()
    }

    protected async innerExecute(): Promise<void> {
        const { lang, country } = this.locale;
        const lastnames = await this.entityRep.getLastnames(lang);
        const lastnamesRootIds = uniq(lastnames.map(name => RootNameHelper.idFromName(name, lang, country)));
        await this.conceptRep.deleteByRootNameIds(lastnamesRootIds);
        await this.rootNameRep.deleteIds(lastnamesRootIds);
        debug(`Deleted lastnames=${JSON.stringify(lastnames)}`);
    }
}
