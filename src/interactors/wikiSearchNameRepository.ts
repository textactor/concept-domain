
import { IWriteRepository, IReadRepository } from '@textactor/domain';
import { WikiSearchName } from '../entities/wikiSearchName';

export interface IWikiSearchNameWriteRepository extends IWriteRepository<string, WikiSearchName> {
    createOrUpdate(data: WikiSearchName): Promise<WikiSearchName>
}

export interface IWikiSearchNameReadRepository extends IReadRepository<string, WikiSearchName> {

}

export interface IWikiSearchNameRepository extends IWikiSearchNameReadRepository, IWikiSearchNameWriteRepository {

}
