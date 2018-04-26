
import { NameHelper, md5, uniq } from '@textactor/domain';
import { formatRootName } from '../utils';
import { RootName } from './rootName';

export type CreatingRootNameData = {
    lang: string
    country: string
    name: string
}

export class RootNameHelper {

    static create(data: CreatingRootNameData): RootName {

        const lang = data.lang.trim().toLowerCase();
        const country = data.country.trim().toLowerCase();
        const name = data.name.trim();

        const id = RootNameHelper.idFromName(name, lang, country);

        const isAbbr = NameHelper.isAbbr(name);
        const countWords = NameHelper.countWords(name);

        const rootName = RootNameHelper.rootName(name, lang);

        const popularity = 1;

        const concept: RootName = {
            id,
            country,
            lang,
            name,
            isAbbr,
            countWords,
            rootName,
            popularity,
        };

        return concept;
    }

    public static rootName(name: string, lang: string) {
        lang = lang.trim();
        name = name.trim();

        const isAbbr = NameHelper.isAbbr(name);

        if (isAbbr) {
            return name;
        }

        if (NameHelper.countWords(name) < 2) {
            if (name.length < 7) {
                return name;
            }
            return formatRootName(name, lang, { accuracy: 2 });
        }

        return formatRootName(name, lang);
    }

    public static idFromName(name: string, lang: string, country: string) {
        name = RootNameHelper.rootName(name, lang);
        name = NameHelper.normalizeName(name, lang);
        name = NameHelper.atonic(name);

        return md5([lang.trim().toLowerCase(), country.trim().toLowerCase(), name.trim()].join('_'))
    }

    static idsFromNames(names: string[], lang: string, country: string) {
        names = names.filter(name => name && name.trim().length > 1);
        return uniq(names.map(name => RootNameHelper.idFromName(name, lang, country)));
    }
}
