import { UseCase } from "@textactor/domain";
import { IConceptWriteRepository } from "./conceptRepository";
import { Locale } from "../types";
import { IWikiEntityReadRepository } from "./wikiEntityRepository";

export class DeleteInvalidConcepts extends UseCase<Locale, void, void> {

    constructor(private conceptRepository: IConceptWriteRepository, private entityRepository: IWikiEntityReadRepository) {
        super()
    }

    protected async innerExecute(locale: Locale): Promise<void> {



    }
}
