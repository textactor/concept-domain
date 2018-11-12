import { UseCase } from "@textactor/domain";
import { WikiTitle } from "../entities/wiki-title";
import { WikiTitleRepository } from "../repositories/wiki-title-repository";

export class CreateOrUpdateWikiTitle extends UseCase<WikiTitle, WikiTitle, void>{
    constructor(private rep: WikiTitleRepository) {
        super();
    }
    protected async innerExecute(item: WikiTitle): Promise<WikiTitle> {
        await this.rep.delete(item.id);
        return this.rep.create(item);
    }
}
