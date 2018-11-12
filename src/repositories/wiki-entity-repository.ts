
import { WikiEntity } from '../entities/wiki-entity';
import { Repository } from '@textactor/domain';

export interface WikiEntityRepository extends Repository<WikiEntity> {
    getByNameHash(hash: string): Promise<WikiEntity[]>
    getByPartialNameHash(hash: string): Promise<WikiEntity[]>
    getInvalidPartialNames(lang: string): Promise<string[]>
    count(): Promise<number>
}
