import { md5, NameHelper, uniq } from "@textactor/domain";

export type WikiSearchName = {
    id: string
    lang?: string
    country?: string
    name?: string
    createdAt?: number
    foundTitles?: string[]
    lastSearchAt?: number
}

export type CreatingWikiSearchNameData = {
    lang: string
    country: string
    name: string
    foundTitles: string[]
    lastSearchAt?: number
}

export class WikiSearchNameHelper {
    static create(data: CreatingWikiSearchNameData) {

        const name = data.name.trim();
        const lang = data.lang.trim().toLowerCase();
        const country = data.country.trim().toLowerCase();
        const foundTitles = uniq(data.foundTitles);

        const normalName = NameHelper.normalizeName(name, lang);

        if (normalName.length < 2) {
            throw new Error(`Invalid name: ${name}`);
        }

        const hash = md5(normalName);

        const id = [lang, country, hash].join('');

        const searchName: WikiSearchName = {
            id,
            name,
            lang,
            country,
            createdAt: Math.round(Date.now() / 1000),
            foundTitles,
            lastSearchAt: data.lastSearchAt || Math.round(Date.now() / 1000),
        };

        return searchName;
    }

    static createId(name: string, lang: string, country: string) {
        name = name.trim();
        lang = lang.trim().toLowerCase();
        country = country.trim().toLowerCase();

        const normalName = NameHelper.normalizeName(name, lang);

        if (normalName.length < 2) {
            throw new Error(`Invalid name: ${name}`);
        }

        const hash = md5(normalName);

        return [lang, country, hash].join('');
    }
}
