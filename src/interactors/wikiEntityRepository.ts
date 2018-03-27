
import { IWriteRepository, IReadRepository } from '@textactor/domain';
import { WikiEntity } from '../entities/wikiEntity';

export interface IWikiEntityWriteRepository extends IWriteRepository<string, WikiEntity> {

}

export interface IWikiEntityReadRepository extends IReadRepository<string, WikiEntity> {
    getByNameHash(hash: string): Promise<WikiEntity[]>
    count(): Promise<number>
    getByPartialNameHash(hash: string): Promise<WikiEntity[]>
}

export interface IWikiEntityRepository extends IWikiEntityReadRepository, IWikiEntityWriteRepository {

}
