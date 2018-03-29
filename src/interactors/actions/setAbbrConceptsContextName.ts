
const debug = require('debug')('textactor:concept-domain');

import { UseCase, seriesPromise, uniq } from "@textactor/domain";
import { IConceptRepository } from "../conceptRepository";
import { Locale } from "../../types";
import { Concept } from "../../entities/concept";
import { ConceptHelper } from "../../entities/conceptHelper";

export class SetAbbrConceptsContextName extends UseCase<void, Map<string, string[]>, void> {

    constructor(private locale: Locale, private conceptRepository: IConceptRepository) {
        super()
    }

    protected async innerExecute(): Promise<Map<string, string[]>> {
        const results: Map<string, string[]> = new Map();

        let concepts = await this.conceptRepository.getAbbrConceptsWithContextName(this.locale);

        await this.setConceptsContextName(concepts, results);

        return results;
    }

    private setConceptsContextName(concepts: Concept[], results: Map<string, string[]>): Promise<Map<string, string[]>> {

        concepts = concepts.sort((a, b) => b.popularity - a.popularity)
            .filter(item => !results.has(item.name) && item.isAbbr);

        return seriesPromise(concepts, concept => {
            if (results.has(concept.name) || !concept.contextNames) {
                return Promise.resolve();
            }
            const id = ConceptHelper.id(concept.name, this.locale.lang, this.locale.country);

            return this.conceptRepository.getById(id)
                .then(abbrConcept => {
                    if (!abbrConcept) {
                        return;
                    }
                    return this.conceptRepository.update({
                        item: {
                            id,
                            contextNames: uniq((abbrConcept.contextNames || []).concat(concept.contextNames))
                        }
                    }).then(() => {
                        debug(`Set concept contextName: ${concept.name}=${concept.contextNames}`);
                        results.set(concept.name, concept.contextNames);
                    })
                })
        })
            .then(() => results);
    }
}
