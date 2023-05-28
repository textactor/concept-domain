import { Locale } from "../../types";
import {
  ConceptContainerRepository,
  ContainerListFilters
} from "../concept-container-repository";
import {
  ConceptContainer,
  ConceptContainerStatus
} from "../../entities/concept-container";
import { MemoryRepository } from "./memory-repository";

export class MemoryConceptContainerRepository
  extends MemoryRepository<ConceptContainer>
  implements ConceptContainerRepository
{
  constructor() {
    super();
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

  getByStatus(
    locale: Locale,
    status: ConceptContainerStatus[]
  ): Promise<ConceptContainer[]> {
    const list: ConceptContainer[] = [];
    for (let item of this.db.values()) {
      if (
        item.country !== locale.country ||
        item.lang !== locale.lang ||
        status.indexOf(item.status) < 0
      ) {
        continue;
      }
      list.push(item);
    }

    return Promise.resolve(list);
  }
  getByUniqueName(uniqueName: string): Promise<ConceptContainer | null> {
    for (let item of this.db.values()) {
      if (item.uniqueName === uniqueName) {
        return Promise.resolve(item);
      }
    }
    return Promise.resolve(null);
  }

  list(filters: ContainerListFilters): Promise<ConceptContainer[]> {
    const skip = filters.skip || 0;
    const list: ConceptContainer[] = [];
    for (let item of this.db.values()) {
      if (item.country !== filters.country || item.lang !== filters.lang) {
        continue;
      }
      if (filters.ownerId && filters.ownerId !== item.ownerId) {
        continue;
      }
      if (filters.uniqueName && filters.uniqueName !== item.uniqueName) {
        continue;
      }
      if (filters.status && filters.status.indexOf(item.status) < 0) {
        continue;
      }
      list.push(item);
    }

    return Promise.resolve(list.slice(skip, skip + filters.limit));
  }

  async create(data: ConceptContainer): Promise<ConceptContainer> {
    if (!!this.db.get(data.id)) {
      return Promise.reject(new Error(`Item already exists!`));
    }
    this.db.set(data.id, { ...{ createdAt: Date.now() }, ...data });

    const entity = await this.getById(data.id);
    if (!entity) {
      throw new Error(`Entity not found!`);
    }
    return entity;
  }

  deleteIds(ids: string[]): Promise<number> {
    let count = 0;
    for (let id of ids) {
      this.db.delete(id) && count++;
    }

    return Promise.resolve(count);
  }

  all(): Promise<ConceptContainer[]> {
    const array: ConceptContainer[] = [];
    for (let item of this.db.values()) {
      array.push(item);
    }

    return Promise.resolve(array);
  }
}
