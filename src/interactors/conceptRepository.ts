
import { IWriteRepository, IReadRepository } from '@textactor/domain';
import { Concept } from '../entities/concept';
// import { Locale } from '../types';

export interface IConceptWriteRepository extends IWriteRepository<string, Concept> {
    deleteUnpopular(containerId: string, popularity: number): Promise<number>
    deleteUnpopularAbbreviations(containerId: string, popularity: number): Promise<number>
    deleteUnpopularOneWorlds(containerId: string, popularity: number): Promise<number>
    deleteAll(containerId: string): Promise<number>
    deleteIds(ids: string[]): Promise<number>
    deleteByRootNameIds(ids: string[]): Promise<number>
    /**
     * Create a new concept or update existing with new fields and increment popularity
     * @param concept Concept to process
     */
    createOrUpdate(concept: Concept): Promise<Concept>
}

export interface IConceptReadRepository extends IReadRepository<string, Concept> {
    // getByNameHash(hash: string): Promise<Concept[]>
    getByRootNameId(id: string): Promise<Concept[]>
    getByRootNameIds(ids: string[]): Promise<Concept[]>
    // list(locale: Locale, limit: number, skip?: number): Promise<Concept[]>
    getConceptsWithAbbr(containerId: string): Promise<Concept[]>
    getAbbrConceptsWithContextName(containerId: string): Promise<Concept[]>
    // count(locale: Locale): Promise<number>
}

export interface IConceptRepository extends IConceptReadRepository, IConceptWriteRepository {

}
