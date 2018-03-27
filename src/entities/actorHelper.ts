import { Concept } from "./concept";
import { WikiEntity } from "./wikiEntity";
import { ConceptActor } from "./actor";
import { NameHelper, uniq, md5 } from "@textactor/domain";

export class ActorHelper {
    static create(concepts: Concept[], entity?: WikiEntity, additionalNames?: string[], concept?: Concept): ConceptActor {

        concept = concept || concepts[0];

        const lang = concept.lang.trim().toLowerCase();
        const country = concept.country.trim().toLowerCase();
        const name = entity && (entity.simpleName || entity.name) || concept.name;
        const slug = NameHelper.slug((entity && entity.name || concept.name).toLowerCase());
        const id = md5([lang, country, slug].join('_'));

        const actor: ConceptActor = {
            id,
            name,
            lang,
            country,
            slug,
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
            entity.abbr = entity.names.find(item => NameHelper.isAbbr(item));
        }

        if (!actor.abbr) {
            const abbrConcept = concepts.find(item => NameHelper.isAbbr(item.name) || !!item.abbr);
            if (abbrConcept) {
                actor.abbr = abbrConcept.abbr || abbrConcept.name;
            }
        }


        actor.names = actor.names.concat(concepts.map(item => item.name));
        actor.names.push(concept.name);

        if (additionalNames) {
            actor.names = actor.names.concat(additionalNames);
            actor.partialNames = additionalNames;
        }

        actor.names = uniq(actor.names);

        return actor;
    }
}
