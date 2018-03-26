
import { IWriteRepository, IReadRepository } from '@textactor/domain';
import { Concept } from '../entities/concept';
import { ILocale } from '../types';

export type PopularConceptHash = {
    hash: string
    ids: string[]
    popularity: number
}

export interface IConceptWriteRepository extends IWriteRepository<string, Concept> {
    deleteUnpopular(locale: ILocale, popularity: number): Promise<number>
    deleteUnpopularAbbreviations(locale: ILocale, popularity: number): Promise<number>
    deleteUnpopularOneWorlds(locale: ILocale, popularity: number): Promise<number>
    deleteAll(locale: ILocale): Promise<number>
    deleteIds(ids: string[]): Promise<number>
    incrementPopularity(id: string): Promise<number>
    createOrIncrementPopularity(concept: Concept): Promise<Concept>
}

export interface IConceptReadRepository extends IReadRepository<string, Concept> {
    getByNameHash(hash: string): Promise<Concept[]>
    getByRootNameHash(hash: string): Promise<Concept[]>
    getPopularRootNameHashes(locale: ILocale, limit: number, skip?: number): Promise<PopularConceptHash[]>
    list(locale: ILocale, limit: number, skip?: number): Promise<Concept[]>
}

export interface IConceptRepository extends IConceptReadRepository, IConceptWriteRepository {

}
