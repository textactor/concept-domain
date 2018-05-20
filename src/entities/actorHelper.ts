import { Concept } from "./concept";
import { WikiEntity } from "./wikiEntity";
import { ConceptActor } from "./actor";
import { uniq } from "@textactor/domain";
import { ConceptHelper } from "./conceptHelper";
import { Locale } from "../types";

export class ActorHelper {
    static build(locale: Locale, names: string[], entity?: WikiEntity): ConceptActor {

        const lang = locale.lang.trim().toLowerCase();
        const country = locale.country.trim().toLowerCase();
        const name = entity && entity.name || names[0];

        const actor: ConceptActor = {
            lang,
            country,
            name,
            wikiEntity: entity,
            names: ActorHelper.buildNames(names, entity),
        };

        if (entity) {
            actor.names.push(entity.name);
            if (entity.wikiPageTitle) {
                actor.names.push(entity.wikiPageTitle);
            }
            actor.names = actor.names.concat(entity.names || []);
        }

        actor.names = uniq(actor.names).filter(name => ConceptHelper.isValidName(name, lang));

        return actor;
    }

    static buildNames(names: string[], entity?: WikiEntity) {
        if (entity) {
            names = (entity.names || []).concat(names);
        }
        return uniq(names);
    }

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
            // concepts,
            // popularity: concepts.reduce<number>((total, current) => total + current.popularity, 0),
            context: concept.context,
        };

        if (entity) {
            actor.names.push(entity.name);
            if (entity.wikiPageTitle) {
                actor.names.push(entity.wikiPageTitle);
            }
            actor.names = actor.names.concat(entity.names || []);
        }

        actor.names = actor.names.concat(ConceptHelper.getConceptsNames(concepts, false));
        if (entity && entity.countryCodes && entity.countryCodes.indexOf(country) > -1) {
            actor.names = actor.names.concat(entity.partialNames);
        }

        actor.names = uniq(actor.names).filter(name => ConceptHelper.isValidName(name, lang));

        return actor;
    }
}
