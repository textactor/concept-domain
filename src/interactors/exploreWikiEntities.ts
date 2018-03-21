
import { UseCase, eachSeries } from '@textactor/domain';
import { IConcept } from '../entities/concept';
import { IConceptReadRepository } from './conceptRepository';
import { ILocale } from '../types';
import { ExploreWikiEntitiesByTitles, SaveWikiEntities } from './actions';
import { IWikiEntityRepository } from './wikiEntityRepository';

export class ExploreWikiEntities extends UseCase<void, void, void> {
    private exploreWikiEntitiesByTitles: ExploreWikiEntitiesByTitles;
    private saveWikiEntities: SaveWikiEntities;

    constructor(private locale: ILocale, private conceptRepository: IConceptReadRepository,
        wikiEntityRepository: IWikiEntityRepository) {
        super()

        this.exploreWikiEntitiesByTitles = new ExploreWikiEntitiesByTitles(locale);
        this.saveWikiEntities = new SaveWikiEntities(wikiEntityRepository);
    }

    protected innerExecute(): Promise<void> {
        let skip = 0;
        const limit = 100;
        const self = this;

        function start(): Promise<void> {
            return self.conceptRepository.list(self.locale, limit, skip)
                .then(concepts => {
                    if (concepts.length === 0) {
                        return;
                    }
                    skip += limit;

                    return eachSeries(concepts, concept => self.processConcept(concept))
                        .then(() => start());
                });
        }

        return start();
    }

    private processConcept(concept: IConcept): Promise<boolean> {
        return this.exploreWikiEntitiesByTitles.execute([concept.name])
            .then(wikiEntities => {
                if (wikiEntities.length) {
                    return this.saveWikiEntities.execute(wikiEntities)
                        .then(() => true);
                }
                return false;
            });
    }
}
