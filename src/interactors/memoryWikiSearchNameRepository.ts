
import { IWikiSearchNameRepository } from './wikiSearchNameRepository';
import { WikiSearchName } from '../entities/wikiSearchName';
import { RepUpdateData } from '@textactor/domain';


export class MemoryWikiSearchNameRepository implements IWikiSearchNameRepository {

    private db: Map<string, WikiSearchName> = new Map()

    createOrUpdate(data: WikiSearchName): Promise<WikiSearchName> {
        const item = this.db.get(data.id);
        if (item) {
            return this.update({ item: data });
        }
        return this.create(data);
    }

    getById(id: string): Promise<WikiSearchName> {
        return Promise.resolve(this.db.get(id));
    }
    getByIds(ids: string[]): Promise<WikiSearchName[]> {
        const list: WikiSearchName[] = [];
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
    create(data: WikiSearchName): Promise<WikiSearchName> {
        if (!!this.db.get(data.id)) {
            return Promise.reject(new Error(`Item already exists!`));
        }
        this.db.set(data.id, Object.assign({ createdAt: new Date(), lastSearchAt: new Date() }, data));

        return this.getById(data.id);
    }
    update(data: RepUpdateData<WikiSearchName>): Promise<WikiSearchName> {
        
        const item = this.db.get(data.item.id);
        if (!item) {
            return Promise.reject(new Error(`Item not found! id=${data.item.id}`));
        }

        delete (<any>data.item).createdAt;

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
