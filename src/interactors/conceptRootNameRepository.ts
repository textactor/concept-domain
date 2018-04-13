import { IWriteRepository, IReadRepository } from '@textactor/domain';
import { RootName } from '../entities/rootName';
import { Locale } from '../types';

export interface IConceptRootNameWriteRepository extends IWriteRepository<string, RootName> {
    deleteUnpopular(locale: Locale, popularity: number): Promise<number>
    deleteUnpopularAbbreviations(locale: Locale, popularity: number): Promise<number>
    deleteUnpopularOneWorlds(locale: Locale, popularity: number): Promise<number>
    deleteAll(locale: Locale): Promise<number>
    deleteIds(ids: string[]): Promise<number>
    createOrUpdate(name: RootName): Promise<RootName>
}

export interface IConceptRootNameReadRepository extends IReadRepository<string, RootName> {
    getMostPopularIds(locale: Locale, limit: number, skip: number, minCountWords?: number): Promise<string[]>
}

export interface IConceptRootNameRepository extends IConceptRootNameReadRepository, IConceptRootNameWriteRepository {

}
