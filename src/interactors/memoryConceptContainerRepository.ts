
import { Concept } from '../entities/concept';
import { Locale } from '../types';
import { RepUpdateData } from '@textactor/domain';
import { IConceptContainerRepository } from './conceptContainerRepository';
import { ConceptContainer, ConceptContainerStatus } from '../entities/conceptContainer';

export class MemoryConceptContainerRepository implements IConceptContainerRepository {

    private db: Map<string, ConceptContainer> = new Map()

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

    getByStatus(locale: Locale, status: ConceptContainerStatus[]): Promise<ConceptContainer[]> {
        const list: Concept[] = []
        for (let item of this.db.values()) {
            if (item.country !== locale.country || item.lang !== locale.lang || status.indexOf(item.status) < 0) {
                continue;
            }
            list.push(item)
        }

        return Promise.resolve(list);
    }
    getByUniqueName(uniqueName: string): Promise<ConceptContainer> {
        for (let item of this.db.values()) {
            if (item.uniqueName === uniqueName) {
                return Promise.resolve(item);
            }
        }
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
    create(data: ConceptContainer): Promise<ConceptContainer> {
        if (!!this.db.get(data.id)) {
            return Promise.reject(new Error(`Item already exists!`));
        }
        this.db.set(data.id, { ...{ createdAt: Date.now() }, ...data });

        return this.getById(data.id);
    }
    update(data: RepUpdateData<ConceptContainer>): Promise<ConceptContainer> {
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

    deleteIds(ids: string[]): Promise<number> {
        let count = 0;
        for (let id of ids) {
            this.db.delete(id) && count++;
        }

        return Promise.resolve(count);
    }

    all(): Promise<Concept[]> {
        const array: Concept[] = []
        for (let item of this.db.values()) {
            array.push(item);
        }

        return Promise.resolve(array);
    }
}
