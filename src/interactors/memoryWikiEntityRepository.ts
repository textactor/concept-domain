
import { IWikiEntityRepository } from './wikiEntityRepository';
import { IWikiEntity } from '../entities/wikiEntity';
import { RepUpdateData } from '@textactor/domain';


export class MemoryWikiEntityRepository implements IWikiEntityRepository {
    private db: Map<string, IWikiEntity> = new Map()

    getByNameHash(hash: string): Promise<IWikiEntity[]> {
        const list: IWikiEntity[] = []
        for (let item of this.db.values()) {
            if (~item.namesHashes.indexOf(hash)) {
                list.push(item)
            }
        }

        return Promise.resolve(list);
    }
    getById(id: string): Promise<IWikiEntity> {
        return Promise.resolve(this.db.get(id));
    }
    getByIds(ids: string[]): Promise<IWikiEntity[]> {
        const list: IWikiEntity[] = [];
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
    create(data: IWikiEntity): Promise<IWikiEntity> {
        if (!!this.db.get(data.id)) {
            return Promise.reject(new Error(`Item already exists!`));
        }
        this.db.set(data.id, Object.assign({ createdAt: new Date() }, data));

        return this.getById(data.id);
    }
    update(_data: RepUpdateData<IWikiEntity>): Promise<IWikiEntity> {
        throw new Error("Method not implemented.");
    }
}
