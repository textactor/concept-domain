
const debug = require('debug')('textactor:concept-domain');

import { UseCase } from "@textactor/domain";
import { Locale } from "../../types";
import { WikiEntity } from "../../entities/wikiEntity";
import { getEntities, WikiEntitiesParams, WikiEntity as ExternWikiEntity } from 'wiki-entity';
import { WikiEntityHelper } from "../../entities/wikiEntityHelper";
import { isTimeoutError, delay } from "../../utils";

export class ExploreWikiEntitiesByTitles extends UseCase<string[], WikiEntity[], null> {

    constructor(private locale: Locale) {
        super()
    }

    protected async innerExecute(titles: string[]): Promise<WikiEntity[]> {

        debug(`exploring wiki entities for ${titles.join('|')}`);

        const findOptions: WikiEntitiesParams = {
            titles: titles.join('|'),
            claims: 'item',
            categories: true,
            extract: 3,
            language: this.locale.lang,
            redirects: true,
            types: true,
        };

        let wikiEntities: ExternWikiEntity[];
        try {
            wikiEntities = await getEntities(findOptions);
        } catch (e) {
            if (isTimeoutError(e)) {
                debug(`ETIMEDOUT retring after 3 sec...`);
                await delay(1000 * 3);
                wikiEntities = await getEntities(findOptions);
            }
        }
        wikiEntities = wikiEntities || [];
        wikiEntities = wikiEntities.filter(item => !!item);

        if (wikiEntities.length === 0) {
            debug(`NO wiki entities found for ${titles.join('|')}`);
            return []
        } else {
            debug(`Found wiki entities for ${titles.join('|')}: ${wikiEntities.map(item => item.label)}`);
        }

        let entities = wikiEntities.map(item => WikiEntityHelper.convert(item, this.locale.lang, this.locale.country));

        entities = entities.filter(item => !WikiEntityHelper.isDisambiguation(item));

        return entities;
    }
}
