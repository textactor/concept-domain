
import { IConcept } from '../entities/concept';
import { ILocale } from '../types';
import { IConceptRepository, PopularConceptHash } from './conceptRepository';
import { RepUpdateData } from '@textactor/domain';

export class MemoryConceptRepository implements IConceptRepository {

    private db: Map<string, IConcept> = new Map()

    list(locale: ILocale, limit: number, skip: number): Promise<IConcept[]> {
        const list: IConcept[] = []
        for (let item of this.db.values()) {
            if (item.country !== locale.country || item.lang !== locale.lang) {
                continue;
            }
            list.push(item)
        }

        return Promise.resolve(list.slice(skip, skip + limit));
    }

    getById(id: string): Promise<IConcept> {
        return Promise.resolve(this.db.get(id));
    }
    getByIds(ids: string[]): Promise<IConcept[]> {
        const list: IConcept[] = [];
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
    create(data: IConcept): Promise<IConcept> {
        if (!!this.db.get(data.id)) {
            return Promise.reject(new Error(`Item already exists!`));
        }
        this.db.set(data.id, Object.assign({ popularity: 1, createdAt: new Date() }, data));

        return this.getById(data.id);
    }
    update(_data: RepUpdateData<IConcept>): Promise<IConcept> {
        throw new Error("Method not implemented.");
    }

    private filterByFieldValue(field: keyof IConcept, value: any): IConcept[] {
        const list: IConcept[] = []
        for (let item of this.db.values()) {
            if (item[field] === value) {
                list.push(item)
            }
        }

        return list;
    }

    getByNameHash(hash: string): Promise<IConcept[]> {

        const list = this.filterByFieldValue('nameHash', hash);

        return Promise.resolve(list);
    }
    getByRootNameHash(hash: string): Promise<IConcept[]> {
        const list = this.filterByFieldValue('rootNameHash', hash);

        return Promise.resolve(list);
    }
    getPopularRootNameHashes(locale: ILocale, limit: number): Promise<PopularConceptHash[]> {
        const map: { [hash: string]: { popularity: number, ids: string[] } } = {}

        for (let item of this.db.values()) {
            if (item.country !== locale.country || item.lang !== locale.lang) {
                continue;
            }

            map[item.rootNameHash] = map[item.rootNameHash] || { popularity: 0, ids: [] };

            map[item.rootNameHash].popularity += item.popularity;
            map[item.rootNameHash].ids.push(item.id);
        }

        const list = Object.keys(map)
            .map(hash => ({ hash, ...map[hash] }))
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, limit);

        return Promise.resolve(list);
    }
    deleteUnpopular(locale: ILocale, popularity: number): Promise<number> {
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
    deleteUnpopularAbbreviations(locale: ILocale, popularity: number): Promise<number> {
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
    deleteUnpopularOneWorlds(locale: ILocale, popularity: number): Promise<number> {
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
    deleteAll(locale: ILocale): Promise<number> {
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
    async createOrIncrementPopularity(concept: IConcept): Promise<IConcept> {
        const id = concept.id;
        let item = this.db.get(id);
        if (!item) {
            await this.create(concept);
        } else {
            await this.incrementPopularity(id);
        }

        return Promise.resolve(this.db.get(id));
    }
}
