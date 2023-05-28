import { WikiEntityRepository } from "../wiki-entity-repository";
import { WikiEntity, WikiEntityType } from "../../entities/wiki-entity";
import { NameHelper, uniq } from "@textactor/domain";
import { MemoryRepository } from "./memory-repository";

export class MemoryWikiEntityRepository
  extends MemoryRepository<WikiEntity>
  implements WikiEntityRepository
{
  constructor() {
    super();
  }

  count(): Promise<number> {
    return Promise.resolve(this.db.size);
  }

  getInvalidPartialNames(lang: string): Promise<string[]> {
    const container: { [index: string]: boolean } = {};
    for (let item of this.db.values()) {
      if (item.lang === lang && item.type === WikiEntityType.PERSON) {
        item.names.forEach((name) => {
          if (NameHelper.countWords(name) < 2 || NameHelper.isAbbr(name)) {
            return;
          }
          const parts = name
            .split(/\s+/g)
            .filter((it) => !NameHelper.isAbbr(it) && it.length > 1);
          for (let it of parts) {
            container[it] = true;
          }
        });
      }
    }

    return Promise.resolve(Object.keys(container));
  }

  getByPartialNameHash(hash: string): Promise<WikiEntity[]> {
    const list: WikiEntity[] = [];
    for (let item of this.db.values()) {
      if (item.partialNamesHashes && ~item.partialNamesHashes.indexOf(hash)) {
        list.push(item);
      }
    }

    return Promise.resolve(uniq(list));
  }

  getByNameHash(hash: string): Promise<WikiEntity[]> {
    const list: WikiEntity[] = [];
    for (let item of this.db.values()) {
      if (~item.namesHashes.indexOf(hash)) {
        list.push(item);
      }
    }

    return Promise.resolve(uniq(list));
  }
  async create(data: WikiEntity): Promise<WikiEntity> {
    if (!!this.db.get(data.id)) {
      return Promise.reject(new Error(`Item already exists!`));
    }
    this.db.set(data.id, Object.assign({ createdAt: new Date() }, data));

    const entity = await this.getById(data.id);
    if (!entity) {
      throw new Error(`Entity not found!`);
    }
    return entity;
  }
}
