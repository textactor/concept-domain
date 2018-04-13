
const debug = require('debug')('textactor:concept-domain');

import { UseCase } from "@textactor/domain";
import { IConceptRepository } from "../conceptRepository";
import { Locale } from "../../types";
import { IConceptRootNameRepository } from "../conceptRootNameRepository";

export interface DeleteUnpopularConceptsOptions {
    minConceptPopularity: number
    minAbbrConceptPopularity: number
    minOneWordConceptPopularity: number

    minRootConceptPopularity: number
    minRootAbbrConceptPopularity: number
    minRootOneWordConceptPopularity: number
}

export class DeleteUnpopularConcepts extends UseCase<DeleteUnpopularConceptsOptions, void, void> {

    constructor(private locale: Locale, private conceptRep: IConceptRepository, private rootNameRep: IConceptRootNameRepository) {
        super()
    }

    protected async innerExecute(options: DeleteUnpopularConceptsOptions): Promise<void> {

        try {
            debug(`Deleting unpopular concepts: ${JSON.stringify(options)}`);

            await this.conceptRep.deleteUnpopular(this.locale, options.minConceptPopularity);
            await this.conceptRep.deleteUnpopularAbbreviations(this.locale, options.minAbbrConceptPopularity);
            await this.conceptRep.deleteUnpopularOneWorlds(this.locale, options.minOneWordConceptPopularity);

            await this.rootNameRep.deleteUnpopular(this.locale, options.minRootConceptPopularity);
            await this.rootNameRep.deleteUnpopularAbbreviations(this.locale, options.minRootAbbrConceptPopularity);
            await this.rootNameRep.deleteUnpopularOneWorlds(this.locale, options.minRootOneWordConceptPopularity);
        } catch (e) {
            return Promise.reject(e);
        }

    }
}
