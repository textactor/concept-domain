
import { WikiTitleRepository } from '../wiki-title-repository';
import { WikiTitle } from '../../entities/wiki-title';
import { MemoryRepository } from './memory-repository';


export class MemoryWikiTitleRepository extends MemoryRepository<WikiTitle> implements WikiTitleRepository {
    constructor() {
        super()
    }
    async create(data: WikiTitle): Promise<WikiTitle> {
        if (!!this.db.get(data.id)) {
            return Promise.reject(new Error(`Item already exists!`));
        }
        this.db.set(data.id, Object.assign({ createdAt: new Date(), lastSearchAt: new Date() }, data));

        const entity = await this.getById(data.id);
        if (!entity) {
            throw new Error(`Entity not found!`)
        }
        return entity;
    }
}
