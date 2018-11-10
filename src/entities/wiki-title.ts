
import { NameHelper, md5 } from "@textactor/domain";

export type WikiTitle = {
    id: string
    lang: string
    title: string
    createdAt?: number
    updatedAt?: number
}

export type BuildWikiTitleParams = {
    lang: string
    title: string
    updatedAt?: number
}

export class WikiTitleHelper {
    static build(params: BuildWikiTitleParams) {

        const title = params.title.trim();
        const lang = params.lang.trim().toLowerCase();

        const id = WikiTitleHelper.createId(title, lang);

        const wikiTitle: WikiTitle = {
            id,
            title,
            lang,
            createdAt: Math.round(Date.now() / 1000),
            updatedAt: params.updatedAt || Math.round(Date.now() / 1000),
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
