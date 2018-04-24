
import { UseCase, seriesPromise } from "@textactor/domain";
import { WikiEntity } from "../../entities/wikiEntity";
import { IWikiEntityRepository } from "../wikiEntityRepository";


export class SaveWikiEntities extends UseCase<WikiEntity[], boolean, null> {

    constructor(private wikiEntityRepository: IWikiEntityRepository) {
        super()
    }

    protected innerExecute(entities: WikiEntity[]): Promise<boolean> {
        return seriesPromise(entities, entity => this.wikiEntityRepository.createOrUpdate(entity))
            .then(() => true);
    }
}
