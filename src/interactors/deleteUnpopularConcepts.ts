import { UseCase } from "@textactor/domain";
import { IConceptWriteRepository } from "./conceptRepository";
import { Locale } from "../types";

export interface DeleteUnpopularConceptsOptions {
    minConceptPopularity?: number
    minAbbrConceptPopularity?: number
    minOneWordConceptPopularity?: number
}

export class DeleteUnpopularConcepts extends UseCase<Locale, void, DeleteUnpopularConceptsOptions> {

    constructor(private repository: IConceptWriteRepository) {
        super()
    }

    protected async innerExecute(locale: Locale, options?: DeleteUnpopularConceptsOptions): Promise<void> {

        options = Object.assign({
            minConceptPopularity: 10,
            minAbbrConceptPopularity: 20,
            minOneWordConceptPopularity: 20,
        }, options);

        try {
            await this.repository.deleteUnpopular(locale, options.minConceptPopularity);
            await this.repository.deleteUnpopularAbbreviations(locale, options.minAbbrConceptPopularity);
            await this.repository.deleteUnpopularOneWorlds(locale, options.minOneWordConceptPopularity);
        } catch (e) {
            return Promise.reject(e);
        }

    }
}
