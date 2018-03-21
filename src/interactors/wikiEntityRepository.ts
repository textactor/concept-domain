
import { IWriteRepository, IReadRepository } from '@textactor/domain';
import { IWikiEntity } from '../entities/wikiEntity';

export interface IWikiEntityWriteRepository extends IWriteRepository<string, IWikiEntity> {

}

export interface IWikiEntityReadRepository extends IReadRepository<string, IWikiEntity> {
    getByNameHash(hash: string): Promise<IWikiEntity[]>
    count(): Promise<number>
}

export interface IWikiEntityRepository extends IWikiEntityReadRepository, IWikiEntityWriteRepository {

}
