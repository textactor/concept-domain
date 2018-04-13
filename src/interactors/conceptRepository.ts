
import { IWriteRepository, IReadRepository } from '@textactor/domain';
import { Concept } from '../entities/concept';
import { Locale } from '../types';

export interface IConceptWriteRepository extends IWriteRepository<string, Concept> {
    deleteUnpopular(locale: Locale, popularity: number): Promise<number>
    deleteUnpopularAbbreviations(locale: Locale, popularity: number): Promise<number>
    deleteUnpopularOneWorlds(locale: Locale, popularity: number): Promise<number>
    deleteAll(locale: Locale): Promise<number>
    deleteIds(ids: string[]): Promise<number>
    deleteByNameHash(hashes: string[]): Promise<number>
    deleteByRootNameIds(ids: string[]): Promise<number>
    // incrementPopularity(id: string): Promise<number>
    /**
     * Create a new concept or update existing with new fields and increment popularity
     * @param concept Concept to process
     */
    createOrUpdate(concept: Concept): Promise<Concept>
}

export interface IConceptReadRepository extends IReadRepository<string, Concept> {
    getByNameHash(hash: string): Promise<Concept[]>
    getByRootNameId(id: string): Promise<Concept[]>
    getByRootNameIds(ids: string[]): Promise<Concept[]>
    list(locale: Locale, limit: number, skip?: number): Promise<Concept[]>
    getConceptsWithAbbr(locale: Locale): Promise<Concept[]>
    getAbbrConceptsWithContextName(locale: Locale): Promise<Concept[]>
    count(locale: Locale): Promise<number>
}

export interface IConceptRepository extends IConceptReadRepository, IConceptWriteRepository {

}
