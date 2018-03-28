
const debug = require('debug')('textactor:concept-domain');

import { UseCase, seriesPromise } from "@textactor/domain";
import { IConceptRepository } from "../conceptRepository";
import { ConceptHelper, Concept } from "../../entities";
import { Locale } from "../../types";

export class SetAbbrConceptsContextName extends UseCase<void, Map<string, string>, void> {

    constructor(private locale: Locale, private conceptRepository: IConceptRepository) {
        super()
    }

    protected async innerExecute(): Promise<Map<string, string>> {
        const results: Map<string, string> = new Map();

        let concepts = await this.conceptRepository.getAbbrConceptsWithContextName(this.locale);

        await this.setConceptsContextName(concepts, results);

        return results;
    }

    private setConceptsContextName(concepts: Concept[], results: Map<string, string>): Promise<Map<string, string>> {

        concepts = concepts.sort((a, b) => b.popularity - a.popularity)
            .filter(item => !results.has(item.name) && item.isAbbr && item.contextName);

        return seriesPromise(concepts, concept => {
            if (results.has(concept.name)) {
                return Promise.resolve();
            }
            const id = ConceptHelper.id(concept.name, this.locale.lang, this.locale.country);

            return this.conceptRepository.update({
                item: {
                    id,
                    contextName: concept.contextName
                }
            }).then(() => {
                debug(`Set concept contextName: ${concept.name}=${concept.contextName}`);
                results.set(concept.name, concept.contextName);
            })
        })
            .then(() => results);
    }
}
