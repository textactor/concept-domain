import { WikiSearchNameRepository } from "../wiki-search-name-repository";
import { WikiSearchName } from "../../entities/wiki-search-name";
import { MemoryRepository } from "./memory-repository";

export class MemoryWikiSearchNameRepository
  extends MemoryRepository<WikiSearchName>
  implements WikiSearchNameRepository
{
  constructor() {
    super();
  }

  async create(data: WikiSearchName): Promise<WikiSearchName> {
    if (!!this.db.get(data.id)) {
      return Promise.reject(new Error(`Item already exists!`));
    }
    this.db.set(
      data.id,
      Object.assign({ createdAt: new Date(), lastSearchAt: new Date() }, data)
    );

    const entity = await this.getById(data.id);
    if (!entity) {
      throw new Error(`Entity not found!`);
    }
    return entity;
  }
}
