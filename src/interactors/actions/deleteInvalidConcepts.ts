
const debug = require('debug')('textactor:concept-domain');

import { UseCase, uniq } from "@textactor/domain";
import { IConceptRepository } from "../conceptRepository";
import { IWikiEntityRepository } from "../wikiEntityRepository";
import { ConceptHelper } from '../../entities/conceptHelper';
import { RootNameHelper, IConceptRootNameRepository } from "../..";
import { ConceptContainer } from "../../entities/conceptContainer";

export class DeleteInvalidConcepts extends UseCase<void, void, void> {

    constructor(private container: ConceptContainer,
        private conceptRep: IConceptRepository,
        private rootNameRep: IConceptRootNameRepository,
        private wikiEntityRep: IWikiEntityRepository) {
        super()
    }

    protected async innerExecute(): Promise<void> {
        const lang = this.container.lang;
        const country = this.container.country;
        const containerId = this.container.id;
        const invalidNames = await this.wikiEntityRep.getInvalidPartialNames(lang);
        debug(`Deleting invalid names: ${JSON.stringify(invalidNames)}`);

        const invalidNamesIds = uniq(invalidNames.map(item => ConceptHelper.id(item, lang, country, containerId)));
        const invalidNamesRootIds = uniq(invalidNames.map(item => RootNameHelper.id(item, lang, country, containerId)));

        await this.conceptRep.deleteIds(invalidNamesIds);
        await this.conceptRep.deleteByRootNameIds(invalidNamesRootIds);
        await this.rootNameRep.deleteIds(invalidNamesRootIds);
    }
}
