
import { IWikiEntityRepository } from './wikiEntityRepository';
import { WikiEntity } from '../entities/wikiEntity';
import { RepUpdateData } from '@textactor/domain';


export class MemoryWikiEntityRepository implements IWikiEntityRepository {

    private db: Map<string, WikiEntity> = new Map()

    count(): Promise<number> {
        return Promise.resolve(this.db.size);
    }

    getByPartialNameHash(hash: string): Promise<WikiEntity[]> {
        const list: WikiEntity[] = []
        for (let item of this.db.values()) {
            if (~item.partialNamesHashes.indexOf(hash)) {
                list.push(item)
            }
        }

        return Promise.resolve(list);
    }

    getByNameHash(hash: string): Promise<WikiEntity[]> {
        const list: WikiEntity[] = []
        for (let item of this.db.values()) {
            if (~item.namesHashes.indexOf(hash)) {
                list.push(item)
            }
        }

        return Promise.resolve(list);
    }
    getById(id: string): Promise<WikiEntity> {
        return Promise.resolve(this.db.get(id));
    }
    getByIds(ids: string[]): Promise<WikiEntity[]> {
        const list: WikiEntity[] = [];
        for (let id of ids) {
            const item = this.db.get(id);
            if (item) {
                list.push(item);
            }
        }
        return Promise.resolve(list);
    }
    exists(id: string): Promise<boolean> {
        return Promise.resolve(!!this.db.get(id));
    }
    delete(id: string): Promise<boolean> {
        return Promise.resolve(this.db.delete(id));
    }
    create(data: WikiEntity): Promise<WikiEntity> {
        if (!!this.db.get(data.id)) {
            return Promise.reject(new Error(`Item already exists!`));
        }
        this.db.set(data.id, Object.assign({ createdAt: new Date() }, data));

        return this.getById(data.id);
    }
    update(_data: RepUpdateData<WikiEntity>): Promise<WikiEntity> {
        throw new Error("Method not implemented.");
    }
}
