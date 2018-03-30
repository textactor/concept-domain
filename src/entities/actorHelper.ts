import { Concept } from "./concept";
import { WikiEntity } from "./wikiEntity";
import { ConceptActor } from "./actor";
import { NameHelper, uniq } from "@textactor/domain";
import { ConceptHelper } from "./conceptHelper";

export class ActorHelper {
    static create(concepts: Concept[], entity?: WikiEntity): ConceptActor {

        const concept = concepts[0];

        const lang = concept.lang.trim().toLowerCase();
        const country = concept.country.trim().toLowerCase();
        const name = entity && entity.name || concept.name;

        const actor: ConceptActor = {
            lang,
            country,
            name,
            wikiEntity: entity,
            names: [],
            concepts,
            popularity: concepts.reduce<number>((total, current) => total + current.popularity, 0),
        };

        if (entity) {
            actor.names.push(entity.name);
            if (entity.wikiPageTitle) {
                actor.names.push(entity.wikiPageTitle);
            }
            actor.names = actor.names.concat(entity.names || []);

            // set abbreviation
            actor.abbr = entity.abbr || NameHelper.findAbbr(entity.names);
        }

        actor.names = actor.names.concat(ConceptHelper.getConceptsNames(concepts, false));

        actor.names = uniq(actor.names).filter(name => ConceptHelper.isValidName(name));

        if (!actor.abbr) {
            actor.abbr = NameHelper.findAbbr(actor.names);
        }

        return actor;
    }
}
