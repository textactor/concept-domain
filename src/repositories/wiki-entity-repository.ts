
import { WikiEntity } from '../entities/wiki-entity';
import { Repository } from '@textactor/domain';

export interface WikiEntityRepository extends Repository<WikiEntity> {
    createOrUpdate(data: WikiEntity): Promise<WikiEntity>
    getByNameHash(hash: string): Promise<WikiEntity[]>
    getByPartialNameHash(hash: string): Promise<WikiEntity[]>
    getInvalidPartialNames(lang: string): Promise<string[]>
    count(): Promise<number>
}
