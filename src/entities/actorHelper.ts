
import { WikiEntity } from "./wikiEntity";
import { ConceptActor } from "./actor";
import { uniq } from "@textactor/domain";
import { ConceptHelper } from "./conceptHelper";
import { Locale } from "../types";

export class ActorHelper {
    static build(locale: Locale, names: string[], entity?: WikiEntity): ConceptActor {

        const lang = locale.lang.trim().toLowerCase();
        const country = locale.country.trim().toLowerCase();
        names = ActorHelper.buildNames(lang, names, entity && entity.names);

        if (entity && entity.countryCodes && entity.countryCodes.indexOf(country) > -1) {
            names = names.concat(entity.partialNames || []);
        }

        names = uniq(names).filter(name => ConceptHelper.isValidName(name, lang));

        if (!names.length) {
            throw new Error(`Invalid ConceptActor: no names!`);
        }

        const name = entity && entity.name || names[0];

        const actor: ConceptActor = {
            lang,
            country,
            name,
            wikiEntity: entity,
            names,
        };

        return actor;
    }

    static buildNames(lang: string, names: string[], entityNames?: string[]) {
        names = (entityNames || []).concat(names || []);
        names = names.filter(name => ConceptHelper.isValidName(name, lang));
        return uniq(names);
    }

    static validate(entity: ConceptActor) {
        if (!entity) {
            throw new Error(`Invalid ConceptActor: null or undefined`);
        }
        if (!entity.lang) {
            throw new Error(`Invalid ConceptActor: invalid lang`);
        }
        if (!entity.country) {
            throw new Error(`Invalid ConceptActor: invalid country`);
        }
        if (!ConceptHelper.isValidName(entity.name, entity.lang)) {
            throw new Error(`Invalid ConceptActor: invalid name: ${entity.name}`);
        }
        if (!entity.names || !entity.names.length) {
            throw new Error(`Invalid ConceptActor: no names`);
        }
        const invalidName = entity.names.find(item => !ConceptHelper.isValidName(item, entity.lang));
        if (invalidName) {
            throw new Error(`Invalid ConceptActor: names contains invalid names: ${invalidName}`);
        }
    }
}
