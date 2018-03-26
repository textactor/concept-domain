
import { WikiEntity as ExternWikiEntity, convertToSimpleEntity, SimpleEntityType } from 'wiki-entity';
import { WikiEntityType, WikiEntity, WikiEntityData } from './wikiEntity';
import { uniq, md5 } from '../utils';
import { NameHelper } from '@textactor/domain';

export class WikiEntityHelper {

    static convert(wikiEntity: ExternWikiEntity, lang: string): WikiEntity {
        lang = lang.trim().toLowerCase();
        const simpleEntity = convertToSimpleEntity(wikiEntity, lang);
        const wikiSplittedName = WikiEntityHelper.splitName(simpleEntity.wikiPageTitle);
        const name = simpleEntity.name || wikiSplittedName && wikiSplittedName.simple || simpleEntity.wikiPageTitle;

        if (!name) {
            throw new Error(`Entity has no name! ${simpleEntity.wikiDataId}`);
        }

        const entity: WikiEntity = {
            id: `${simpleEntity.lang.trim().toUpperCase()}${simpleEntity.wikiDataId}`,
            name: NameHelper.standardText(name, lang),
            nameHash: WikiEntityHelper.nameHash(name, lang),
            lang: lang,
            description: simpleEntity.description,
            aliases: uniq(wikiEntity.aliases || []),
            about: simpleEntity.about,
            wikiDataId: simpleEntity.wikiDataId,
            wikiPageId: simpleEntity.wikiPageId,
            wikiPageTitle: simpleEntity.wikiPageTitle,
            types: simpleEntity.types,
            countryCode: simpleEntity.countryCode && simpleEntity.countryCode.trim().toLowerCase(),
            data: simpleEntity.data,
            categories: simpleEntity.categories,
            rank: 1,
        };

        if (simpleEntity.type) {
            entity.type = WikiEntityHelper.convertSimpleEntityType(simpleEntity.type);

            const lastname = entity.type === WikiEntityType.PERSON && WikiEntityHelper.getLastname(entity.data, entity.name);
            if (lastname) {
                entity.lastname = lastname;
            }
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

        const splittedName = WikiEntityHelper.splitName(entity.name);
        if (splittedName) {
            entity.specialName = splittedName.special;
            entity.simpleName = splittedName.simple;
        } else if (entity.wikiPageTitle) {
            const splittedName = WikiEntityHelper.splitName(entity.wikiPageTitle);
            if (splittedName) {
                entity.specialName = splittedName.special;
                entity.simpleName = splittedName.simple;
            }
        }

        entity.names = [entity.name];
        if (entity.wikiPageTitle) {
            entity.names.push(entity.wikiPageTitle);
        }
        if (wikiEntity.redirects && wikiEntity.redirects.length) {
            entity.names = entity.names.concat(wikiEntity.redirects);
            if (!entity.abbr) {
                entity.abbr = NameHelper.findAbbr(wikiEntity.redirects);
            }
        }

        if (entity.simpleName && entity.simpleName.split(/\s+/g).length > 1) {
            entity.names.push(entity.simpleName);
        }

        const simpleNames = entity.names.map(name => {
            const sname = WikiEntityHelper.splitName(name);
            if (sname) {
                return sname.simple;
            }
        }).filter(name => !!name);

        entity.names = entity.names.concat(simpleNames);
        entity.names = entity.names.filter(name => name.trim().length > 1);
        entity.names = entity.names.map(name => NameHelper.standardText(name, lang));

        entity.names = uniq(entity.names);

        entity.namesHashes = entity.names.map(item => WikiEntityHelper.nameHash(item, lang));
        entity.namesHashes = uniq(entity.namesHashes);

        return entity;
    }

    static nameHash(name: string, lang: string) {
        lang = lang.trim().toLowerCase();

        name = name.trim().replace(/\s+/g, ' ').trim();
        name = NameHelper.standardText(name, lang);

        if (!NameHelper.isAbbr(name)) {
            name = name.toLowerCase();
        }

        return md5([lang, name].join('_'));
    }

    static convertSimpleEntityType(type: SimpleEntityType): WikiEntityType {
        switch (type) {
            case SimpleEntityType.EVENT: return WikiEntityType.EVENT;
            case SimpleEntityType.ORG: return WikiEntityType.ORG;
            case SimpleEntityType.PERSON: return WikiEntityType.PERSON;
            case SimpleEntityType.PLACE: return WikiEntityType.PLACE;
            case SimpleEntityType.PRODUCT: return WikiEntityType.PRODUCT;
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
