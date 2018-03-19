
import { UseCase } from "@textactor/domain";
import { ILocale } from "../../../types";
import { IWikiEntity } from "../../../entities/wikiEntity";
import { getEntities } from 'wiki-entity';
import { WikiEntityHelper } from "../../../entities/wikiEntityHelper";

export class ExploreWikiEntities extends UseCase<string[], IWikiEntity[], null> {

    constructor(private locale: ILocale) {
        super()
    }

    protected async innerExecute(titles: string[]): Promise<IWikiEntity[]> {

        const wikiEntities = await getEntities({
            titles: titles.join('|'),
            claims: 'item',
            categories: true,
            extract: 3,
            language: this.locale.lang,
            redirects: true,
        });

        if (!wikiEntities || wikiEntities.length === 0) {
            return []
        }

        return wikiEntities.map(item => WikiEntityHelper.convert(item, this.locale.lang));

    }
}
