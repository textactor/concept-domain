
import { WikiEntity as ExternWikiEntity, convertToSimpleEntity, SimpleEntityType } from 'wiki-entity';
import { WikiEntityType, IWikiEntity } from './wikiEntity';
import { uniq, md5 } from '../utils';
import { NameHelper } from '@textactor/domain';

export class WikiEntityHelper {

    static convert(wikiEntity: ExternWikiEntity, lang: string): IWikiEntity {
        lang = lang.trim().toLowerCase();
        const simpleEntity = convertToSimpleEntity(wikiEntity, lang);
        const entity: IWikiEntity = {
            id: `${simpleEntity.lang.trim().toUpperCase()}${simpleEntity.wikiDataId}`,
            name: simpleEntity.name,
            nameHash: WikiEntityHelper.nameHash(simpleEntity.name, lang),
            lang: lang,
            abbr: simpleEntity.abbr,
            description: simpleEntity.description,
            aliases: uniq(wikiEntity.aliases || []),
            about: simpleEntity.about,
            wikiDataId: simpleEntity.wikiDataId,
            wikiPageId: simpleEntity.wikiPageId,
            wikiPageTitle: simpleEntity.wikiPageTitle,
            type: WikiEntityHelper.convertSimpleEntityType(simpleEntity.type),
            types: simpleEntity.types,
            countryCode: simpleEntity.countryCode && simpleEntity.countryCode.trim().toLowerCase(),
            data: simpleEntity.data,
            categories: simpleEntity.categories,
            rank: 1,
        };

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
        }

        if (entity.simpleName && entity.simpleName.split(/\s+/g).length > 1) {
            entity.names.push(entity.simpleName);
        }

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
            special: name.substring(firstIndex + 1, lastIndex - 1)
        }
    }

}
