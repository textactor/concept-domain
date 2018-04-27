
import { Concept } from '../entities/concept';
import { Locale } from '../types';
import { IConceptRepository } from './conceptRepository';
import { RepUpdateData, seriesPromise } from '@textactor/domain';
import { uniqProp } from '../utils';

export class MemoryConceptRepository implements IConceptRepository {
    private db: Map<string, Concept> = new Map()

    async getByRootNameIds(ids: string[]): Promise<Concept[]> {
        let list: Concept[] = [];
        await seriesPromise(ids, id => this.getByRootNameId(id).then(concepts => list = list.concat(concepts)));

        return uniqProp(list, 'id');
    }

    count(locale: Locale): Promise<number> {
        let count = 0;
        for (let item of this.db.values()) {
            if (item.country !== locale.country || item.lang !== locale.lang) {
                continue;
            }

            count++;
        }

        return Promise.resolve(count);
    }

    getAbbrConceptsWithContextName(locale: Locale): Promise<Concept[]> {
        const list: Concept[] = []
        for (let item of this.db.values()) {
            if (item.country === locale.country && item.lang === locale.lang && item.isAbbr && item.contextNames) {
                list.push(item);
            }
        }

        return Promise.resolve(list);
    }

    getConceptsWithAbbr(locale: Locale): Promise<Concept[]> {
        const list: Concept[] = []
        for (let item of this.db.values()) {
            if (item.country === locale.country && item.lang === locale.lang && !item.isAbbr && item.abbr) {
                list.push(item);
            }
        }

        return Promise.resolve(list);
    }

    deleteByNameHash(hashes: string[]): Promise<number> {
        let count = 0;
        for (let hash of hashes) {
            const list = this.filterByFieldValue('nameHash', hash);
            count += list.length;

            for (let item of list) {
                this.db.delete(item.id);
            }
        }

        return Promise.resolve(count);
    }

    async deleteByRootNameIds(ids: string[]): Promise<number> {

        const list = await this.getByRootNameIds(ids);
        let count = list.length;
        for (let item of list) {
            this.db.delete(item.id);
        }

        return Promise.resolve(count);
    }

    list(locale: Locale, limit: number, skip?: number): Promise<Concept[]> {
        skip = skip || 0;
        const list: Concept[] = []
        for (let item of this.db.values()) {
            if (item.country !== locale.country || item.lang !== locale.lang) {
                continue;
            }
            list.push(item)
        }

        return Promise.resolve(list.slice(skip, skip + limit));
    }

    getById(id: string): Promise<Concept> {
        return Promise.resolve(this.db.get(id));
    }
    getByIds(ids: string[]): Promise<Concept[]> {
        const list: Concept[] = [];
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
    create(data: Concept): Promise<Concept> {
        if (!!this.db.get(data.id)) {
            return Promise.reject(new Error(`Item already exists!`));
        }
        this.db.set(data.id, { ...{ popularity: 1, createdAt: Date.now() }, ...data });

        return this.getById(data.id);
    }
    update(data: RepUpdateData<Concept>): Promise<Concept> {
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

    private filterByFieldValue(field: keyof Concept, value: any): Concept[] {
        const list: Concept[] = []
        for (let item of this.db.values()) {
            if (item[field] === value) {
                list.push(item)
            }
        }

        return list;
    }

    getByNameHash(hash: string): Promise<Concept[]> {

        const list = this.filterByFieldValue('nameHash', hash);

        return Promise.resolve(list);
    }
    getByRootNameId(id: string): Promise<Concept[]> {
        const list: Concept[] = []
        for (let item of this.db.values()) {
            if (~item.rootNameIds.indexOf(id)) {
                list.push(item)
            }
        }

        return Promise.resolve(list);
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
            await this.create(concept);
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
