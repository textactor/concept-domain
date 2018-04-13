
const debug = require('debug')('textactor:concept-domain');

import { UseCase, uniq, seriesPromise } from "@textactor/domain";
import { Locale } from "../../types";
import { findTitles } from 'entity-finder';
import { delay } from "../../utils";

export class FindWikiTitles extends UseCase<string[], string[], null> {

    constructor(private locale: Locale) {
        super()
    }

    protected async innerExecute(names: string[]): Promise<string[]> {

        names = uniq(names);

        const tags = getWikiTitleTags(this.locale);
        let allTitles: string[] = [];

        await seriesPromise(names, async name => {
            debug(`finding wiki titles for ${name}...`);
            const titles = await findTitles(name, this.locale.lang, { limit: 5, tags, orderByTagsLimit: 2 });
            if (titles && titles.length) {
                const titleNames = titles.map(item => item.title).filter(item => item && item.trim().length >= 2);
                debug(`found wiki titles for ${name}: ${titleNames}`);
                allTitles = allTitles.concat(titleNames);
            }
            if (names.length > 1) {
                await delay(500 * 1);
            }
        });

        return uniq(allTitles);
    }
}

function getWikiTitleTags(locale: Locale) {
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
    ru: {
        ru: ['Россия', 'РФ', 'России', 'Российской'],
    },
}
