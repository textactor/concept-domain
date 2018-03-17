
import { WikiEntity as ExternWikiEntity, convertToSimpleEntity, SimpleEntityType } from 'wiki-entity';
import { WikiEntityType, IWikiEntity } from './wikiEntity';
import { uniq } from '../utils';
import { NameHelper, md5 } from '@textactor/domain';

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

        entity.names = [entity.name];
        if (entity.wikiPageTitle) {
            entity.names.push(entity.wikiPageTitle);
        }
        if (wikiEntity.redirects && wikiEntity.redirects.length) {
            entity.names = entity.names.concat(wikiEntity.redirects);
        }

        entity.names = uniq(entity.names);

        return entity;
    }

    static nameHash(name: string, lang: string) {
        name = name.trim().replace(/\s+/g, ' ').trim();
        lang = lang.trim().toLowerCase();
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
}
