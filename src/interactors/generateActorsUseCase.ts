
import { UseCase } from '@textactor/domain';
import { IConceptRepository } from './conceptRepository';
import { IWikiEntityRepository } from './wikiEntityRepository';
import { ILocale } from '../types';
import { IActorsGenerator, ActorsGenerator } from './generator/actorsGenerator';

export class GenerateActorsUseCase extends UseCase<ILocale, IActorsGenerator, void> {
    constructor(private conceptRepository: IConceptRepository, private wikiEntityRepository: IWikiEntityRepository) {
        super()
    }

    protected innerExecute(data: ILocale) {
        return Promise.resolve(new ActorsGenerator(data, {
            concept: this.conceptRepository,
            wikiEntity: this.wikiEntityRepository,
        }));
    }
}
