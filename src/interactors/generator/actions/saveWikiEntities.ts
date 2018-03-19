
import { UseCase } from "@textactor/domain";
import { IWikiEntity } from "../../../entities/wikiEntity";
import { IWikiEntityRepository } from "../../wikiEntityRepository";


export class SaveWikiEntities extends UseCase<IWikiEntity[], boolean, null> {

    constructor(private wikiEntityRepository: IWikiEntityRepository) {
        super()
    }

    protected async innerExecute(entities: IWikiEntity[]): Promise<boolean> {
        for (let entity of entities) {
            const exists = await this.wikiEntityRepository.exists(entity.id);
            if (!exists) {
                await this.wikiEntityRepository.create(entity);
                continue;
            }
        }

        return Promise.resolve(true);
    }
}
