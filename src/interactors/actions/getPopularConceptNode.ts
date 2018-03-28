
import { UseCase, uniq } from "@textactor/domain";
import { IConceptReadRepository } from "../conceptRepository";
import { Locale } from "../../types";
import { Concept } from "../../entities/concept";

export type PopularConceptNode = {
    hash: string
    ids: string[]
    popularity: number
    topConcepts?: Concept[]
}

export class GetPopularConceptNode extends UseCase<null, PopularConceptNode, null> {

    constructor(private locale: Locale, private conceptRepository: IConceptReadRepository) {
        super()
    }

    protected async innerExecute(): Promise<PopularConceptNode> {

        const popularHashes = await this.conceptRepository.getPopularRootNameHashes(this.locale, 1);

        if (popularHashes.length < 1) {
            return null;
        }

        const popularHash = popularHashes[0];

        const node: PopularConceptNode = { ...popularHash };

        node.topConcepts = await this.conceptRepository.getByIds(node.ids.slice(0, 5));

        return node;
    }

    static getTopConceptsNames(node: PopularConceptNode, limit: number): string[] {
        return uniq(node.topConcepts.map(item => item.name)).slice(0, limit);
    }
}
