
const debug = require('debug')('textactor:concept-domain');

import { UseCase } from "@textactor/domain";
import { ILocale } from "../../types";
import { findTitles } from 'entity-finder';
import { delay, uniq } from "../../utils";

export class FindWikiTitles extends UseCase<string[], string[], null> {

    constructor(private locale: ILocale) {
        super()
    }

    protected async innerExecute(names: string[]): Promise<string[]> {

        names = uniq(names);

        const tags = getWikiTitleTags(this.locale);
        let allTitles: string[] = [];

        for (let name of names) {
            debug(`finding wiki titles for ${name}...`);
            const titles = await findTitles(name, this.locale.lang, { limit: 5, tags, orderByTagsLimit: 2 });
            if (titles && titles.length) {
                const titleNames = titles.map(item => item.title).filter(item => item && item.trim().length >= 2);
                debug(`found wiki titles for ${name}: ${titleNames}`);
                allTitles = allTitles.concat(titleNames);
            }
            await delay(1000 * 1)
        }

        return Promise.resolve(uniq(allTitles));
    }
}

function getWikiTitleTags(locale: ILocale) {
    if (LOCALE_COUNTRY_TAGS[locale.country]) {
        return LOCALE_COUNTRY_TAGS[locale.country][locale.lang];
    }
}

const LOCALE_COUNTRY_TAGS: { [country: string]: { [lang: string]: string[] } } = {
    md: {
        ro: ['republica moldova', 'moldova'],
    },
    ro: {
        ro: ['românia', 'româniei'],
    },
}
