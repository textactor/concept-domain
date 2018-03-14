
import { IWriteRepository, IReadRepository } from '@textactor/domain';
import { IConcept } from '../entities/concept';
import { ILocale } from '../types';

export interface IConceptWriteRepository extends IWriteRepository<string, IConcept> {
    deleteUnpopular(locale: ILocale, popularity: number): Promise<number>
    deleteAll(locale: ILocale): Promise<number>
    incrementPopularity(id: string): Promise<number>
    createOrIncrementPopularity(concept: IConcept): Promise<IConcept>
}

export interface IConceptReadRepository extends IReadRepository<string, IConcept> {
    getByTextHash(hash: string): Promise<IConcept[]>
    getByRootTextHash(hash: string): Promise<IConcept[]>
}

export interface IConceptRepository extends IConceptReadRepository, IConceptWriteRepository {

}
