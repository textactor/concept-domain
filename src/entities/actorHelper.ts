import { Concept } from "./concept";
import { IWikiEntity, WikiEntityData, WikiEntityType } from "./wikiEntity";
import { ConceptActor } from "./actor";
import { NameHelper } from "@textactor/domain";
import { md5, uniq } from "../utils";

export class ActorHelper {
    static create(concepts: Concept[], entity?: IWikiEntity, concept?: Concept): ConceptActor {

        concept = concept || concepts[0];

        const lang = concept.lang.trim().toLowerCase();
        const country = concept.country.trim().toLowerCase();
        const name = entity && (entity.simpleName || entity.name) || concept.name;
        const slug = NameHelper.slug((entity && entity.name || concept.name).toLowerCase());
        const id = md5([lang, country, slug].join('_'));
        const actorNameCountWords = name.split(/\s+/g).length;

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
            const lastname = entity.type === WikiEntityType.PERSON && ActorHelper.getLastname(entity.data, name);
            if (lastname) {
                actor.lastname = lastname;
            }
            // set short name
            let shortName: string = actor.name;
            entity.names.forEach(item => {
                const countWords = item.split(/\s+/g).length;
                if (item && !NameHelper.isAbbr(item) && !NameHelper.endsWithNumberWord(item) && item.length < shortName.length && countWords < actorNameCountWords) {
                    if (!lastname || lastname.toUpperCase() !== item.toString()) {
                        shortName = item;
                    }
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

    static getLastname(data: WikiEntityData, name?: string): string {
        if (!data) {
            return;
        }
        if (data.P734 && data.P734.length) {
            return data.P734[0];
        }
        if (!name) {
            return;
        }

        const nameParts = name.split(/\s+/g);

        if (nameParts.length < 2) {
            return;
        }

        const firstName = data.P735 && data.P735.length && data.P735[0];
        if (!firstName) {
            return;
        }

        if (firstName.toLowerCase() === nameParts[0].toLowerCase()) {
            return nameParts.slice(1).join(' ');
        }

    }
}
