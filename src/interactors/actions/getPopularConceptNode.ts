
import { UseCase, uniq } from "@textactor/domain";
import { IConceptReadRepository } from "../conceptRepository";
import { Locale } from "../../types";
import { Concept } from "../../entities/concept";
import { IConceptRootNameRepository } from "../conceptRootNameRepository";

export type PopularConceptNode = {
    rootId: string
    ids: string[]
    // popularity: number
    concepts?: Concept[]
}

export class GetPopularConceptNode extends UseCase<null, PopularConceptNode, null> {
    private minCountWords = 2;

    constructor(private locale: Locale,
        private conceptRep: IConceptReadRepository,
        private rootNameRep: IConceptRootNameRepository) {
        super()
    }

    protected async innerExecute(): Promise<PopularConceptNode> {

        const rootIds = await this.rootNameRep.getMostPopularIds(this.locale, 1, 0, this.minCountWords);

        if (rootIds.length < 1) {
            if (this.minCountWords === 1) {
                return null;
            }
            this.minCountWords = 1;
            return this.innerExecute();
        }

        const rootId = rootIds[0];

        const concepts = await this.conceptRep.getByRootNameId(rootId);
        const ids = uniq(concepts.map(item => item.id));

        const node: PopularConceptNode = {
            rootId,
            ids,
            concepts,
        };

        return node;
    }

    static getTopConceptsNames(node: PopularConceptNode, limit: number): string[] {
        return uniq(node.concepts.map(item => item.name)).slice(0, limit);
    }
}
