import { IConcept } from "./concept";
import { IWikiEntity } from "./wikiEntity";
import { IActor } from "./actor";
import { NameHelper } from "@textactor/domain";
import { md5, uniq } from "../utils";

export class ActorHelper {
    static create(concepts: IConcept[], entity?: IWikiEntity, concept?: IConcept): IActor {

        concept = concept || concepts[0];

        const lang = concept.lang.trim().toLowerCase();
        const country = concept.country.trim().toLowerCase();
        const name = entity && (entity.simpleName || entity.name) || concept.name;
        const slug = NameHelper.slug((entity && entity.name || concept.name).toLowerCase());
        const id = md5([lang, country, slug].join('_'));

        const actor: IActor = {
            id,
            name,
            lang,
            country,
            slug,
            wikiEntity: entity,
            names: [],
            concepts,
        };

        if (entity) {
            actor.names.push(entity.name);
            if (entity.wikiPageTitle) {
                actor.names.push(entity.wikiPageTitle);
            }
            actor.names = actor.names.concat(entity.names || []);
            // set short name
            let shortName: string = actor.name;
            entity.names.forEach(item => {
                if (item && !NameHelper.isAbbr(item) && !NameHelper.endsWithNumberWord(item) && item.length < shortName.length) {
                    shortName = item;
                }
            });
            if (shortName.length < actor.name.length) {
                actor.shortName = shortName;
            }
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

        actor.names = uniq(actor.names);

        return actor;
    }
}
