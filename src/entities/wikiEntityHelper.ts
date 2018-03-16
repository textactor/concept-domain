
import { WikiEntity as ExternWikiEntity, convertToSimpleEntity, SimpleEntityType } from 'wiki-entity';
import { WikiEntityType, IWikiEntity } from './wikiEntity';
import { uniq } from '../utils';

export class WikiEntityHelper {
    static convert(wikiEntity: ExternWikiEntity, lang: string): IWikiEntity {
        lang = lang.trim().toLowerCase();
        const simpleEntity = convertToSimpleEntity(wikiEntity, lang);
        const entity: IWikiEntity = {
            id: `${simpleEntity.lang.trim().toUpperCase()}${simpleEntity.wikiDataId}`,
            name: simpleEntity.name,
            lang: simpleEntity.lang,
            abbr: simpleEntity.abbr,
            description: simpleEntity.description,
            aliases: uniq(wikiEntity.aliases || []),
            about: simpleEntity.about,
            wikiDataId: simpleEntity.wikiDataId,
            wikiPageId: simpleEntity.wikiPageId,
            wikiPageTitle: simpleEntity.wikiPageTitle,
            type: WikiEntityHelper.convertSimpleEntityType(simpleEntity.type),
            types: simpleEntity.types,
            countryCode: simpleEntity.countryCode,
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

        return entity;
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
