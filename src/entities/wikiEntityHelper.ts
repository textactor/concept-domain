
import { WikiEntity as ExternWikiEntity, convertToSimpleEntity, SimpleEntityType } from 'wiki-entity';
import { WikiEntityType, WikiEntity } from './wikiEntity';
import { NameHelper, uniq, md5 } from '@textactor/domain';
import { getPartialName } from '../utils';
import { RootNameHelper } from './rootNameHelper';

export class WikiEntityHelper {

    static convert(wikiEntity: ExternWikiEntity, lang: string, country: string): WikiEntity {
        lang = lang.trim().toLowerCase();
        country = country.trim().toLowerCase();
        const simpleEntity = convertToSimpleEntity(wikiEntity, lang);
        const name = NameHelper.standardText(simpleEntity.name || simpleEntity.wikiPageTitle, lang);

        if (!name) {
            throw new Error(`Entity has no name! ${simpleEntity.wikiDataId}`);
        }

        const entity: WikiEntity = {
            id: `${simpleEntity.lang.trim().toUpperCase()}${simpleEntity.wikiDataId}`,
            name: name,
            nameHash: WikiEntityHelper.nameHash(name, lang),
            lang: lang,
            description: simpleEntity.description,
            aliases: uniq(wikiEntity.aliases || []),
            about: simpleEntity.about,
            wikiDataId: simpleEntity.wikiDataId,
            wikiPageId: simpleEntity.wikiPageId,
            wikiPageTitle: simpleEntity.wikiPageTitle,
            types: simpleEntity.types,
            countryCodes: simpleEntity.countryCodes,
            data: simpleEntity.data,
            categories: simpleEntity.categories,
            rank: 1,
        };
        if (entity.countryCodes && entity.countryCodes.length === 0) {
            delete entity.countryCodes;
        }

        if (!entity.countryCodes) {
            const code = getCountryByTitle([entity.wikiPageTitle, entity.name], lang);
            if (code) {
                entity.countryCodes = [code];
            }
        }

        if (simpleEntity.type) {
            entity.type = WikiEntityHelper.convertSimpleEntityType(simpleEntity.type);
        }

        if (simpleEntity.abbr) {
            entity.abbr = simpleEntity.abbr;
        }

        entity.rank += entity.aliases.length;
        if (wikiEntity.sitelinks) {
            entity.rank += Object.keys(wikiEntity.sitelinks).length * 5;
        }
        if (entity.data) {
            entity.rank += Object.keys(entity.data).length;
        }

        let splittedName = WikiEntityHelper.splitName(entity.name);
        if (splittedName) {
            entity.specialName = splittedName.special;
            entity.simpleName = splittedName.simple;
        } else if (entity.wikiPageTitle) {
            splittedName = WikiEntityHelper.splitName(entity.wikiPageTitle);
            if (splittedName) {
                entity.specialName = splittedName.special;
                entity.simpleName = splittedName.simple;
            }
        }

        entity.names = [entity.name, simpleEntity.name, entity.wikiPageTitle]
            .filter(name => WikiEntityHelper.isValidName(name));

        if (wikiEntity.redirects && wikiEntity.redirects.length) {
            entity.names = entity.names.concat(wikiEntity.redirects);
            if (!entity.abbr) {
                entity.abbr = NameHelper.findAbbr(wikiEntity.redirects);
            }
        }

        // if (splittedName && NameHelper.countWords(splittedName.simple) > 1) {
        //     entity.names.push(splittedName.simple);
        // }

        entity.names = entity.names.map(name => NameHelper.standardText(name, lang));
        entity.names = entity.names.filter(name => WikiEntityHelper.isValidName(name));
        entity.names = uniq(entity.names);

        entity.secondaryNames = [];

        entity.names.forEach(name => {
            let nname = WikiEntityHelper.rootName(name, lang);
            if (nname !== name && WikiEntityHelper.isValidName(nname)) {
                entity.secondaryNames.push(nname);
            }
        });

        entity.namesHashes = WikiEntityHelper.namesHashes(entity.names.concat(entity.secondaryNames), lang);

        entity.namesHashes = uniq(entity.namesHashes);

        let partialNames = entity.names.map(name => getPartialName(name, lang, country))
            .filter(name => !!name && NameHelper.countWords(name) > 1);

        partialNames = uniq(partialNames);

        entity.partialNames = partialNames;

        entity.partialNamesHashes = WikiEntityHelper.namesHashes(entity.partialNames, lang);

        const partialNamesRoot = partialNames.map(name => RootNameHelper.rootName(name, lang));
        const partialNamesRootHashes = WikiEntityHelper.namesHashes(partialNamesRoot, lang);

        entity.partialNamesHashes = entity.partialNamesHashes.concat(partialNamesRootHashes);

        entity.partialNamesHashes = uniq(entity.partialNamesHashes);

        return entity;
    }

    static isValidName(name: string) {
        return name && name.trim().length > 1;
    }

    static nameHash(name: string, lang: string) {
        lang = lang.trim().toLowerCase();

        name = name.trim();
        name = NameHelper.normalizeName(name, lang);
        name = NameHelper.atonic(name);

        return md5([lang, name].join('_'));
    }

    static namesHashes(names: string[], lang: string) {
        names = names.filter(name => WikiEntityHelper.isValidName(name));
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

function getCountryByTitle(titles: string[], lang: string): string {
    if (!COUNTRY_NAMES[lang]) {
        return;
    }
    const title = titles.filter(item => !!item).join('; ');
    for (let country of Object.keys(COUNTRY_NAMES[lang])) {
        const names = COUNTRY_NAMES[lang][country];
        for (let name of names) {
            if (title.indexOf(name) > 0) {
                return country;
            }
        }
    }
}

const COUNTRY_NAMES: { [lang: string]: { [country: string]: string[] } } = {
    ro: {
        ro: ['România', 'României', 'București'],
        md: ['Republica Moldova', 'Moldova', 'Moldovei', 'Chișinău'],
    },
    ru: {
        ru: ['Россия', 'Российская Федерация', 'России', 'Российской Федерации'],
        md: ['Молдова', 'Молдавия', 'Молдавии', 'Кишинёв', 'Кишинёве', 'Кишинёва'],
    }
}
