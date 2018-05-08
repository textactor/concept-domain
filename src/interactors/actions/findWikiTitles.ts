
const debug = require('debug')('textactor:concept-domain');

import { UseCase, uniq, seriesPromise } from "@textactor/domain";
import { Locale } from "../../types";
import { findTitles } from 'entity-finder';
import { delay, isTimeoutError } from "../../utils";

export class FindWikiTitles extends UseCase<string[], string[], null> {

    constructor(private locale: Locale, private countryTags: ICountryTagsService) {
        super()
    }

    protected async innerExecute(names: string[]): Promise<string[]> {

        const lang = this.locale.lang;
        const country = this.locale.country;

        names = uniq(names);

        const tags = this.countryTags.getTags(country, lang);
        let allTitles: string[] = [];

        await seriesPromise(names, async name => {
            debug(`finding wiki titles for ${name}...`);
            let titles: {
                title: string;
                simple?: string;
                special?: string;
                description?: string;
                categories?: string[];
            }[];
            const findOptions = { limit: 5, tags, orderByTagsLimit: 2 };
            try {
                titles = await findTitles(name, this.locale.lang, findOptions);
            } catch (e) {
                if (isTimeoutError(e)) {
                    debug(`ETIMEDOUT retring after 3 sec...`);
                    await delay(1000 * 3);
                    titles = await findTitles(name, this.locale.lang, findOptions);
                } else {
                    throw e;
                }
            }
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

export interface ICountryTagsService {
    getTags(country: string, lang: string): string[]
}
