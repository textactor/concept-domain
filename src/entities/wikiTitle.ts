import { md5, NameHelper } from "@textactor/domain";

export type WikiTitle = {
    id: string
    lang?: string
    title?: string
    createdAt?: number
    lastSearchAt?: number
}

export type CreatingWikiTitleData = {
    lang: string
    title: string
    lastSearchAt?: number
}

export class WikiTitleHelper {
    static create(data: CreatingWikiTitleData) {

        const title = data.title.trim();
        const lang = data.lang.trim().toLowerCase();

        const normalTitle = NameHelper.normalizeName(title, lang);

        if (normalTitle.length < 2) {
            throw new Error(`Invalid title: ${title}`);
        }

        const hash = md5(normalTitle);

        const id = [lang, hash].join('');

        const wikiTitle: WikiTitle = {
            id,
            title,
            lang,
            createdAt: Math.round(Date.now() / 1000),
            lastSearchAt: data.lastSearchAt || Math.round(Date.now() / 1000),
        };

        return wikiTitle;
    }

    static createId(title: string, lang: string) {
        title = title.trim();
        lang = lang.trim().toLowerCase();

        const normalTitle = NameHelper.normalizeName(title, lang);

        if (normalTitle.length < 2) {
            throw new Error(`Invalid title: ${title}`);
        }

        const hash = md5(normalTitle);

        return [lang, hash].join('');
    }
}
