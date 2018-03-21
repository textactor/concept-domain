import { UseCase } from "@textactor/domain";
import { IConceptWriteRepository } from "./conceptRepository";
import { ILocale } from "../types";

export interface DeleteUnpopularConceptsOptions {
    minConceptPopularity?: number
    minAbbrConceptPopularity?: number
    minOneWordConceptPopularity?: number
}

export class DeleteUnpopularConcepts extends UseCase<ILocale, void, DeleteUnpopularConceptsOptions> {

    constructor(private repository: IConceptWriteRepository) {
        super()
    }

    protected async innerExecute(locale: ILocale, options?: DeleteUnpopularConceptsOptions): Promise<void> {

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
