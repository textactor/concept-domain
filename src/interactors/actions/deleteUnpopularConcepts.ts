
const debug = require('debug')('textactor:concept-domain');

import { UseCase } from "@textactor/domain";
import { IConceptRepository } from "../conceptRepository";
import { Locale } from "../../types";

export interface DeleteUnpopularConceptsOptions {
    minConceptPopularity: number
    minAbbrConceptPopularity: number
    minOneWordConceptPopularity: number
}

export class DeleteUnpopularConcepts extends UseCase<DeleteUnpopularConceptsOptions, void, void> {

    constructor(private locale: Locale, private repository: IConceptRepository) {
        super()
    }

    protected async innerExecute(options: DeleteUnpopularConceptsOptions): Promise<void> {

        try {
            debug(`Deleting unpopular concepts: ${JSON.stringify(options)}`);

            await this.repository.deleteUnpopular(this.locale, options.minConceptPopularity);
            await this.repository.deleteUnpopularAbbreviations(this.locale, options.minAbbrConceptPopularity);
            await this.repository.deleteUnpopularOneWorlds(this.locale, options.minOneWordConceptPopularity);
        } catch (e) {
            return Promise.reject(e);
        }

    }
}

function getMinConceptPopularity(totalConcepts: number) {
    const CONCEPTS_PER_TEXT = 5;
    let minConceptPopularity = totalConcepts / CONCEPTS_PER_TEXT;
    minConceptPopularity = minConceptPopularity / 100;
    minConceptPopularity = minConceptPopularity * 5;

    return Math.round(minConceptPopularity);
}

export function createDeleteUnpopularConceptsOptions(totalConcepts: number): DeleteUnpopularConceptsOptions {
    const minConceptPopularity = getMinConceptPopularity(totalConcepts);

    return {
        minConceptPopularity,
        minAbbrConceptPopularity: minConceptPopularity * 2,
        minOneWordConceptPopularity: minConceptPopularity * 2,
    };
}
