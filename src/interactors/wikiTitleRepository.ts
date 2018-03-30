
import { IWriteRepository, IReadRepository } from '@textactor/domain';
import { WikiTitle } from '../entities/wikiTitle';

export interface IWikiTitleWriteRepository extends IWriteRepository<string, WikiTitle> {
    createOrUpdate(data: WikiTitle): Promise<WikiTitle>
}

export interface IWikiTitleReadRepository extends IReadRepository<string, WikiTitle> {

}

export interface IWikiTitleRepository extends IWikiTitleReadRepository, IWikiTitleWriteRepository {

}
