
import { IWriteRepository, IReadRepository } from '@textactor/domain';
import { WikiEntity } from '../entities/wikiEntity';

export interface IWikiEntityWriteRepository extends IWriteRepository<string, WikiEntity> {
    createOrUpdate(data: WikiEntity): Promise<WikiEntity>
}

export interface IWikiEntityReadRepository extends IReadRepository<string, WikiEntity> {
    getByNameHash(hash: string): Promise<WikiEntity[]>
    getByPartialNameHash(hash: string): Promise<WikiEntity[]>
    // getLastnames(lang: string): Promise<string[]>
    getInvalidPartialNames(lang: string): Promise<string[]>
    count(): Promise<number>
}

export interface IWikiEntityRepository extends IWikiEntityReadRepository, IWikiEntityWriteRepository {

}
