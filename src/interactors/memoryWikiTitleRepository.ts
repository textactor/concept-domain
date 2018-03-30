
import { IWikiTitleRepository } from './wikiTitleRepository';
import { WikiTitle } from '../entities/wikiTitle';
import { RepUpdateData } from '@textactor/domain';


export class MemoryWikiTitleRepository implements IWikiTitleRepository {

    private db: Map<string, WikiTitle> = new Map()

    createOrUpdate(data: WikiTitle): Promise<WikiTitle> {
        const item = this.db.get(data.id);
        if (item) {
            return this.update({ item: data });
        }
        return this.create(data);
    }

    getById(id: string): Promise<WikiTitle> {
        return Promise.resolve(this.db.get(id));
    }
    getByIds(ids: string[]): Promise<WikiTitle[]> {
        const list: WikiTitle[] = [];
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
    create(data: WikiTitle): Promise<WikiTitle> {
        if (!!this.db.get(data.id)) {
            return Promise.reject(new Error(`Item already exists!`));
        }
        this.db.set(data.id, Object.assign({ createdAt: new Date(), lastSearchAt: new Date() }, data));

        return this.getById(data.id);
    }
    update(data: RepUpdateData<WikiTitle>): Promise<WikiTitle> {
        
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
