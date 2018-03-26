
const debug = require('debug')('textactor:concept-domain');

import { UseCase } from "@textactor/domain";
import { ILocale } from "../../types";
import { WikiEntity } from "../../entities/wikiEntity";
import { getEntities } from 'wiki-entity';
import { WikiEntityHelper } from "../../entities/wikiEntityHelper";

export class ExploreWikiEntitiesByTitles extends UseCase<string[], WikiEntity[], null> {

    constructor(private locale: ILocale) {
        super()
    }

    protected async innerExecute(titles: string[]): Promise<WikiEntity[]> {

        debug(`exploring wiki entities for ${titles.join('|')}`);

        const wikiEntities = await getEntities({
            titles: titles.join('|'),
            claims: 'item',
            categories: true,
            extract: 3,
            language: this.locale.lang,
            redirects: true,
            types: true,
        });

        if (!wikiEntities || wikiEntities.length === 0) {
            debug(`NO wiki entities found for ${titles.join('|')}`);
            return []
        } else {
            debug(`Found wiki entities for ${titles.join('|')}: ${wikiEntities.map(item => item.label)}`);
        }

        let entities = wikiEntities.map(item => WikiEntityHelper.convert(item, this.locale.lang));

        entities.filter(item => !WikiEntityHelper.isDisambiguation(item));

        return entities;
    }
}
