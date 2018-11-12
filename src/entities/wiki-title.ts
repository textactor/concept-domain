
import { NameHelper, md5, unixTime } from "@textactor/domain";

export type WikiTitle = {
    id: string
    lang: string
    title: string
    createdAt: number
    updatedAt?: number
    expiresAt: number
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

        const createdAt = unixTime();
        const expiresAt = WikiTitleHelper.createExpiresAt(createdAt);

        const wikiTitle: WikiTitle = {
            id,
            title,
            lang,
            createdAt,
            updatedAt: params.updatedAt || createdAt,
            expiresAt,
        };

        return wikiTitle;
    }

    public static getExpiresAtFieldName() {
        return 'expiresAt';
    }

    public static createExpiresAt(createdAt: number) {
        const TTL = 86400 * 5 // 5 days

        return createdAt + TTL;
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
