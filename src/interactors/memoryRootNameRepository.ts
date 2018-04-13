
import { Concept } from '../entities/concept';
import { Locale } from '../types';
import { RepUpdateData } from '@textactor/domain';
import { IConceptRootNameRepository } from './conceptRootNameRepository';
import { RootName } from '../entities/rootName';

export class MemoryRootNameRepository implements IConceptRootNameRepository {
    private db: Map<string, RootName> = new Map()

    getMostPopularIds(locale: Locale, limit: number, skip: number, minCountWords?: number): Promise<string[]> {
        const list: string[] = [];
        for (let item of this.db.values()) {
            if (item.country !== locale.country || item.lang !== locale.lang) {
                continue;
            }
            if (Number.isFinite(minCountWords) && item.countWords < minCountWords) {
                continue;
            }
            list.push(item.id);
        }
        return Promise.resolve(list.slice(skip, skip + limit));
    }

    getById(id: string): Promise<RootName> {
        return Promise.resolve(this.db.get(id));
    }
    getByIds(ids: string[]): Promise<RootName[]> {
        const list: RootName[] = [];
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
    create(data: RootName): Promise<RootName> {
        if (!!this.db.get(data.id)) {
            return Promise.reject(new Error(`Item already exists!`));
        }
        this.db.set(data.id, { ...{ popularity: 1, createdAt: Date.now() }, ...data });

        return this.getById(data.id);
    }
    update(data: RepUpdateData<RootName>): Promise<RootName> {
        const item = this.db.get(data.item.id);
        if (!item) {
            return Promise.reject(new Error(`Item not found! id=${data.item.id}`));
        }

        for (let prop in data.item) {
            if ([null, undefined].indexOf((<any>data.item)[prop]) < 0) {
                (<any>item)[prop] = (<any>data.item)[prop];
            }
        }

        if (data.delete) {
            for (let prop of data.delete) {
                delete (<any>item)[prop];
            }
        }

        return Promise.resolve(item);
    }

    deleteUnpopular(locale: Locale, popularity: number): Promise<number> {
        let count = 0;
        for (let item of this.db.values()) {
            if (item.country !== locale.country || item.lang !== locale.lang) {
                continue;
            }
            if (item.popularity <= popularity) {
                this.db.delete(item.id) && count++;
            }
        }

        return Promise.resolve(count);
    }
    deleteUnpopularAbbreviations(locale: Locale, popularity: number): Promise<number> {
        let count = 0;
        for (let item of this.db.values()) {
            if (item.country !== locale.country || item.lang !== locale.lang) {
                continue;
            }
            if (item.isAbbr && item.popularity <= popularity) {
                this.db.delete(item.id) && count++;
            }
        }

        return Promise.resolve(count);
    }
    deleteUnpopularOneWorlds(locale: Locale, popularity: number): Promise<number> {
        let count = 0;
        for (let item of this.db.values()) {
            if (item.country !== locale.country || item.lang !== locale.lang) {
                continue;
            }
            if (item.countWords === 1 && item.popularity <= popularity) {
                this.db.delete(item.id) && count++;
            }
        }

        return Promise.resolve(count);
    }
    deleteAll(locale: Locale): Promise<number> {
        let count = 0;
        for (let item of this.db.values()) {
            if (item.country !== locale.country || item.lang !== locale.lang) {
                continue;
            }

            this.db.delete(item.id) && count++;
        }

        return Promise.resolve(count);
    }
    deleteIds(ids: string[]): Promise<number> {
        let count = 0;
        for (let id of ids) {
            this.db.delete(id) && count++;
        }

        return Promise.resolve(count);
    }
    incrementPopularity(id: string): Promise<number> {
        const item = this.db.get(id);

        if (!item) {
            return Promise.resolve(null);
        }
        item.popularity++;

        return Promise.resolve(item.popularity);
    }
    async createOrUpdate(concept: Concept): Promise<Concept> {
        concept = { ...concept };
        const id = concept.id;
        let item = this.db.get(id);
        if (!item) {
            item = await this.create(concept);
        } else {
            item.popularity++;
        }

        return Promise.resolve(item);
    }

    all(): Promise<Concept[]> {
        const array: Concept[] = []
        for (let item of this.db.values()) {
            array.push(item);
        }

        return Promise.resolve(array);
    }
}
