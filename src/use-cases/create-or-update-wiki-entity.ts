import { UseCase } from "@textactor/domain";
import { WikiEntity } from "../entities/wiki-entity";
import { WikiEntityRepository } from "../repositories/wiki-entity-repository";

export class CreateOrUpdateWikiEntity extends UseCase<
  WikiEntity,
  WikiEntity,
  void
> {
  constructor(private rep: WikiEntityRepository) {
    super();
  }
  protected async innerExecute(item: WikiEntity): Promise<WikiEntity> {
    await this.rep.delete(item.id);
    return this.rep.create(item);
  }
}
