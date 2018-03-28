
import { IWriteRepository, IReadRepository } from '@textactor/domain';
import { Concept } from '../entities/concept';
import { Locale } from '../types';

export type PopularConceptHash = {
    hash: string
    ids: string[]
    popularity: number
}

export interface IConceptWriteRepository extends IWriteRepository<string, Concept> {
    deleteUnpopular(locale: Locale, popularity: number): Promise<number>
    deleteUnpopularAbbreviations(locale: Locale, popularity: number): Promise<number>
    deleteUnpopularOneWorlds(locale: Locale, popularity: number): Promise<number>
    deleteAll(locale: Locale): Promise<number>
    deleteIds(ids: string[]): Promise<number>
    deleteByNameHash(hashes: string[]): Promise<number>
    incrementPopularity(id: string): Promise<number>
    createOrIncrementPopularity(concept: Concept): Promise<Concept>
}

export interface IConceptReadRepository extends IReadRepository<string, Concept> {
    getByNameHash(hash: string): Promise<Concept[]>
    getByRootNameHash(hash: string): Promise<Concept[]>
    getPopularRootNameHashes(locale: Locale, limit: number, skip?: number): Promise<PopularConceptHash[]>
    list(locale: Locale, limit: number, skip?: number): Promise<Concept[]>
    getConceptsWithAbbr(locale: Locale): Promise<Concept[]>
    getAbbrConceptsWithContextName(locale: Locale): Promise<Concept[]>
}

export interface IConceptRepository extends IConceptReadRepository, IConceptWriteRepository {

}
