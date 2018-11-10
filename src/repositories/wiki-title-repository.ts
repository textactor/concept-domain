
import { WikiTitle } from '../entities/wiki-title';
import { Repository } from '@textactor/domain';


export interface WikiTitleRepository extends Repository<WikiTitle> {
    createOrUpdate(data: WikiTitle): Promise<WikiTitle>
}
