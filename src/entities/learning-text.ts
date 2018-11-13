import { md5, unixTime } from "@textactor/domain";

export type LearningText = {
    id: string
    lang: string
    country: string
    text: string
    createdAt: number
    expiresAt: number
}

export type BuildLearningTextParams = {
    lang: string
    country: string
    text: string
}

export class LearningTextHelper {
    static build({ lang, country, text }: BuildLearningTextParams) {
        lang = lang.trim().toLowerCase();
        country = country.trim().toLowerCase();
        text = text.trim();

        const id = LearningTextHelper.createId({ lang, country, text });

        const createdAt = unixTime();
        const expiresAt = LearningTextHelper.createExpiresAt(createdAt);

        const item: LearningText = {
            id,
            text,
            lang,
            country,
            createdAt,
            expiresAt,
        }

        return item;
    }

    static getExpiresAtFieldName() {
        return 'expiresAt';
    }

    static createExpiresAt(createdAt: number) {
        return createdAt + 86400 * 7; // 7 days
    }

    static createId({ lang, country, text }: BuildLearningTextParams) {
        lang = lang.trim().toLowerCase();
        country = country.trim().toLowerCase();
        const hash = md5(text.trim().toLowerCase());

        return lang + country + hash;
    }
}
