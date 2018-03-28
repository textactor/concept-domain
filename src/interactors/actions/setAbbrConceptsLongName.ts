
const debug = require('debug')('textactor:concept-domain');

import { UseCase, seriesPromise } from "@textactor/domain";
import { IConceptRepository } from "../conceptRepository";
import { Locale } from "../../types";
import { Concept } from "../../entities/concept";
import { ConceptHelper } from "../../entities/conceptHelper";

export class SetAbbrConceptsLongName extends UseCase<void, Map<string, string>, void> {

    constructor(private locale: Locale, private conceptRepository: IConceptRepository) {
        super()
    }

    protected async innerExecute(): Promise<Map<string, string>> {
        const results: Map<string, string> = new Map();

        let concepts = await this.conceptRepository.getConceptsWithAbbr(this.locale);

        await this.setConceptsLongName(concepts, results);

        return results;
    }

    private setConceptsLongName(concepts: Concept[], results: Map<string, string>): Promise<Map<string, string>> {

        concepts = concepts.sort((a, b) => b.popularity - a.popularity)
            .filter(item => item.abbr && !results.has(item.abbr));

        return seriesPromise(concepts, concept => {
            if (results.has(concept.abbr)) {
                return Promise.resolve();
            }
            const id = ConceptHelper.id(concept.abbr, this.locale.lang, this.locale.country);

            return this.conceptRepository.update({
                item: {
                    id,
                    abbrLongName: concept.name
                }
            }).then(() => {
                debug(`Set concept longName: ${concept.abbr}=${concept.name}`);
                results.set(concept.abbr, concept.name);
            })
        })
            .then(() => results);
    }
}
