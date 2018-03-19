
import { UseCase } from '@textactor/domain';
import { IConceptRepository } from './conceptRepository';
import { IWikiEntityRepository } from './wikiEntityRepository';
import { ILocale } from '../types';
import { IActorsGenerator, ActorsGenerator, ActorsGeneratorOptions } from './generator/actorsGenerator';

export class GenerateActorsUseCase extends UseCase<ILocale, IActorsGenerator, ActorsGeneratorOptions> {
    constructor(private conceptRepository: IConceptRepository, private wikiEntityRepository: IWikiEntityRepository) {
        super()
    }

    protected innerExecute(data: ILocale, options?: ActorsGeneratorOptions) {
        return Promise.resolve(new ActorsGenerator(data, {
            concept: this.conceptRepository,
            wikiEntity: this.wikiEntityRepository,
        }, options));
    }
}
