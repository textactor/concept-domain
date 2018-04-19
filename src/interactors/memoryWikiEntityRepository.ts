
import { IWikiEntityRepository } from './wikiEntityRepository';
import { WikiEntity } from '../entities/wikiEntity';
import { RepUpdateData, uniq } from '@textactor/domain';


export class MemoryWikiEntityRepository implements IWikiEntityRepository {

    private db: Map<string, WikiEntity> = new Map()

    count(): Promise<number> {
        return Promise.resolve(this.db.size);
    }

    getLastnames(lang: string): Promise<string[]> {
        const list: string[] = []
        for (let item of this.db.values()) {
            if (item.lang === lang && item.lastname) {
                list.push(item.lastname)
            }
        }

        return Promise.resolve(list);
    }

    getByPartialNameHash(hash: string): Promise<WikiEntity[]> {
        const list: WikiEntity[] = []
        for (let item of this.db.values()) {
            if (~item.partialNamesHashes.indexOf(hash)) {
                list.push(item)
            }
        }

        return Promise.resolve(uniq(list));
    }

    getByNameHash(hash: string): Promise<WikiEntity[]> {
        const list: WikiEntity[] = []
        for (let item of this.db.values()) {
            if (~item.namesHashes.indexOf(hash)) {
                list.push(item)
            }
        }

        return Promise.resolve(uniq(list));
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
    update(data: RepUpdateData<WikiEntity>): Promise<WikiEntity> {
        const item = this.db.get(data.item.id);
        if (!item) {
            return Promise.reject(new Error(`Item not found! id=${data.item.id}`));
        }

        for (let prop in data.item) {
            (<any>item)[prop] = (<any>data.item)[prop]
        }

        if (data.delete) {
            for (let prop of data.delete) {
                delete (<any>item)[prop];
            }
        }

        return Promise.resolve(item);
    }
}
