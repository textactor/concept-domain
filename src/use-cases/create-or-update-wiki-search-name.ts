import { UseCase } from "@textactor/domain";
import { WikiSearchName } from "../entities/wiki-search-name";
import { WikiSearchNameRepository } from "../repositories/wiki-search-name-repository";

export class CreateOrUpdateWikiSearchName extends UseCase<
  WikiSearchName,
  WikiSearchName,
  void
> {
  constructor(private rep: WikiSearchNameRepository) {
    super();
  }
  protected async innerExecute(item: WikiSearchName): Promise<WikiSearchName> {
    await this.rep.delete(item.id);
    return this.rep.create(item);
  }
}
