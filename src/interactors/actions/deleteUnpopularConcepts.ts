
const debug = require('debug')('textactor:concept-domain');

import { UseCase } from "@textactor/domain";
import { IConceptRepository } from "../conceptRepository";
import { IConceptRootNameRepository } from "../conceptRootNameRepository";
import { ConceptContainer } from "../../entities/conceptContainer";

export interface DeleteUnpopularConceptsOptions {
    minConceptPopularity: number
    minAbbrConceptPopularity: number
    minOneWordConceptPopularity: number

    minRootConceptPopularity: number
    minRootAbbrConceptPopularity: number
    minRootOneWordConceptPopularity: number
}

export class DeleteUnpopularConcepts extends UseCase<DeleteUnpopularConceptsOptions, void, void> {

    constructor(private container: ConceptContainer, private conceptRep: IConceptRepository, private rootNameRep: IConceptRootNameRepository) {
        super()
    }

    protected async innerExecute(options: DeleteUnpopularConceptsOptions): Promise<void> {
        debug(`Deleting unpopular concepts: ${JSON.stringify(options)}`);

        await this.conceptRep.deleteUnpopular(this.container.id, options.minConceptPopularity);
        await this.conceptRep.deleteUnpopularAbbreviations(this.container.id, options.minAbbrConceptPopularity);
        await this.conceptRep.deleteUnpopularOneWorlds(this.container.id, options.minOneWordConceptPopularity);

        await this.rootNameRep.deleteUnpopular(this.container.id, options.minRootConceptPopularity);
        await this.rootNameRep.deleteUnpopularAbbreviations(this.container.id, options.minRootAbbrConceptPopularity);
        await this.rootNameRep.deleteUnpopularOneWorlds(this.container.id, options.minRootOneWordConceptPopularity);
    }
}
