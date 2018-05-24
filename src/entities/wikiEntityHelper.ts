
import { SimpleEntityType, SimpleEntity } from 'wiki-entity';
import { WikiEntityType, WikiEntity } from './wikiEntity';
import { NameHelper, uniq, md5 } from '@textactor/domain';
import { partialName } from 'partial-name';
import { RootNameHelper } from './rootNameHelper';
import { ConceptHelper } from './conceptHelper';

export class WikiEntityHelper {

    static getPartialName(name: string, lang: string, entityName: string): string {
        if (!name || NameHelper.countWords(name) < 2) {
            return null;
        }

        const exResult = /\(([^)]+)\)$/.exec(name);
        let partial: string
        if (exResult) {
            partial = name.substr(0, exResult.index).trim();
            if (NameHelper.countWords(partial) < 2) {
                partial = null;
            }
        }

        if (!partial) {
            partial = partialName(name, { lang });
            if (partial && NameHelper.countWords(partial) < 2) {
                partial = null;
            }
        }

        if (partial) {
            const partialWords = partial.split(/\s+/g);
            const entityNameWords = entityName.split(/\s+/g);
            if (partialWords.length >= entityNameWords.length) {
                return partial;
            }
            const partialFirstWord = NameHelper.atonic(partial.split(/\s+/)[0].toLowerCase());
            const entityNameFirstWord = NameHelper.atonic(entityName.split(/\s+/)[0].toLowerCase());

            if (partialFirstWord !== entityNameFirstWord) {
                return null;
            }
        }

        return partial;
    }

    static getName(entity: SimpleEntity): string {
        return entity.wikiPageTitle;
    }

    static isValidName(name: string, lang: string) {
        return ConceptHelper.isValidName(name, lang);
    }

    static nameHash(name: string, lang: string) {
        lang = lang.trim().toLowerCase();

        name = name.trim();
        name = NameHelper.normalizeName(name, lang);
        name = NameHelper.atonic(name);

        return md5([lang, name].join('_'));
    }

    static namesHashes(names: string[], lang: string) {
        names = names.filter(name => WikiEntityHelper.isValidName(name, lang));
        const hashes = uniq(names.map(name => WikiEntityHelper.nameHash(name, lang)));

        return hashes;
    }

    static rootName(name: string, lang: string) {
        return RootNameHelper.rootName(name, lang);
    }

    static rootNameHash(name: string, lang: string) {
        return WikiEntityHelper.nameHash(WikiEntityHelper.rootName(name, lang), lang);
    }

    static convertSimpleEntityType(type: SimpleEntityType): WikiEntityType {
        switch (type) {
            case SimpleEntityType.EVENT: return WikiEntityType.EVENT;
            case SimpleEntityType.ORG: return WikiEntityType.ORG;
            case SimpleEntityType.PERSON: return WikiEntityType.PERSON;
            case SimpleEntityType.PLACE: return WikiEntityType.PLACE;
            case SimpleEntityType.PRODUCT: return WikiEntityType.PRODUCT;
            case SimpleEntityType.WORK: return WikiEntityType.WORK;
        }
    }

    static splitName(name: string): { simple: string, special: string } {
        const firstIndex = name.indexOf('(');
        if (firstIndex < 3) {
            return null;
        }
        const lastIndex = name.indexOf(')');
        if (lastIndex !== name.length - 1) {
            return null;
        }

        return {
            simple: name.substr(0, firstIndex).trim(),
            special: name.substring(firstIndex + 1, lastIndex)
        }
    }

    static getSimpleName(name: string): string {
        const splitName = WikiEntityHelper.splitName(name);
        if (splitName) {
            return splitName.simple;
        }
    }

    static isDisambiguation(entity: WikiEntity) {
        return entity && entity.data && entity.data.P31 && entity.data.P31.indexOf('Q4167410') > -1;
    }

    static getLastname(name: string): string {

        if (!name || name.indexOf('(') > -1) {
            return;
        }

        const nameParts = name.trim().split(/\s+/g);

        if (nameParts.length !== 2) {
            return;
        }

        const lastname = nameParts.slice(1).join(' ');

        if (!NameHelper.isAbbr(lastname) && !NameHelper.isIrregular(lastname)) {
            return lastname;
        }
    }

    static getPopularity(rank: number): EntityPopularity {
        if (!rank || rank < 0) {
            return EntityPopularity.UNKNOWN;
        }
        const r = rank / 10;
        if (r < 2) {
            return EntityPopularity.UNKNOWN;
        }
        if (r < 4) {
            return EntityPopularity.LOW;
        }
        if (r < 6) {
            return EntityPopularity.NORMAL;
        }
        if (r < 8) {
            return EntityPopularity.HIGH;
        }

        return EntityPopularity.POPULAR;
    }
}

export enum EntityPopularity {
    UNKNOWN = 1,
    LOW = 2,
    NORMAL = 3,
    HIGH = 4,
    POPULAR = 5,
}
