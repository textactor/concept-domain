
const debug = require('debug')('textactor:concept-domain');

import { UseCase, seriesPromise, uniq } from "@textactor/domain";
import { IConceptRepository } from "../conceptRepository";
import { Concept } from "../../entities/concept";
import { ConceptHelper } from "../../entities/conceptHelper";
import { ConceptContainer } from "../../entities/conceptContainer";

export class SetAbbrConceptsLongName extends UseCase<void, Map<string, string>, void> {

    constructor(private container: ConceptContainer, private conceptRep: IConceptRepository) {
        super()
    }

    protected async innerExecute(): Promise<Map<string, string>> {
        const results: Map<string, string> = new Map();

        let concepts = await this.conceptRep.getConceptsWithAbbr(this.container.id);

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
            const id = ConceptHelper.id(concept.abbr, this.container.lang, this.container.country, this.container.id);

            return this.conceptRep.getById(id)
                .then(abbrConcept => {
                    if (!abbrConcept) {
                        return;
                    }
                    abbrConcept.abbrLongNames = abbrConcept.abbrLongNames || [];
                    abbrConcept.abbrLongNames.push(concept.name);
                    abbrConcept.abbrLongNames = uniq(abbrConcept.abbrLongNames);

                    return this.conceptRep.update({
                        item: {
                            id,
                            abbrLongNames: abbrConcept.abbrLongNames,
                        }
                    }).then(() => {
                        debug(`Set concept longName: ${concept.abbr}=${concept.name}`);
                        results.set(concept.abbr, concept.name);
                    })
                });
        }).then(() => results);
    }
}
