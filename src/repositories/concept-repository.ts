
import { Concept } from '../entities/concept';
import { Repository } from '@textactor/domain';

export type PopularConceptsOptions = {
    minCountWords?: number
    maxCountWords?: number
}

export interface ConceptRepository extends Repository<Concept> {
    getByRootNameId(id: string): Promise<Concept[]>
    getByRootNameIds(ids: string[]): Promise<Concept[]>
    getConceptsWithAbbr(containerId: string): Promise<Concept[]>
    getMostPopular(containerId: string, limit: number, skip: number, options?: PopularConceptsOptions): Promise<Concept[]>

    deleteUnpopular(containerId: string, popularity: number): Promise<number>
    deleteUnpopularAbbreviations(containerId: string, popularity: number): Promise<number>
    deleteUnpopularOneWorlds(containerId: string, popularity: number): Promise<number>
    deleteAll(containerId: string): Promise<number>
    deleteIds(ids: string[]): Promise<number>
    deleteByRootNameIds(ids: string[]): Promise<number>
}
