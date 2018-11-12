import { UseCase, uniq } from "@textactor/domain";
import { Concept } from "../entities/concept";
import { ConceptRepository } from "../repositories/concept-repository";

export class CreateOrUpdateConcept extends UseCase<Concept, Concept, void>{
    constructor(private rep: ConceptRepository) {
        super();
    }
    protected async innerExecute(item: Concept): Promise<Concept> {

        const dbItem = await this.rep.getById(item.id);

        if (dbItem) {
            const popularity = item.popularity + dbItem.popularity;
            const rootNameIds = uniq(dbItem.rootNameIds.concat(item.rootNameIds));
            const abbr = item.abbr || dbItem.abbr;
            const set: Partial<Concept> = { popularity, rootNameIds };
            if (abbr) {
                set.abbr = abbr;
            }
            const id = item.id;
            return this.rep.update({ id: id, set });
        }
        else {
            return this.rep.create(item);
        }
    }
}
