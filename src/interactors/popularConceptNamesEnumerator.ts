
// const debug = require('debug')('textactor:concept-domain');

import { INamesEnumerator } from "./namesEnumerator";
import { ConceptContainer } from "../entities/conceptContainer";
import { IConceptReadRepository } from "./conceptRepository";
import { IConceptRootNameRepository } from "./conceptRootNameRepository";
import { ConceptHelper } from "../entities/conceptHelper";

const START_MIN_COUNT_WORDS = 2;

export type PopularConceptNamesEnumeratorOptions = {
    rootNames: boolean
}

export class PopularConceptNamesEnumerator implements INamesEnumerator {
    private skip = 0;
    private limit = 10;
    private currentIndex = -1;
    private currentRootIds: string[];
    private end = false;
    private minCountWords = START_MIN_COUNT_WORDS;

    constructor(private options: PopularConceptNamesEnumeratorOptions,
        private container: ConceptContainer,
        private conceptRep: IConceptReadRepository,
        private rootNameRep: IConceptRootNameRepository) { }

    private reset() {
        this.skip = 0;
        this.limit = 10;
        this.currentIndex = -1;
        this.currentRootIds = null;
    }

    atEnd(): boolean {
        return this.end;
    }

    async next(): Promise<string[]> {
        if (this.end) {
            return Promise.resolve([]);
        }
        if (this.currentRootIds && this.currentIndex < this.currentRootIds.length) {
            return await this.getConceptNames(this.currentRootIds[this.currentIndex++]);
        }
        const rootIds = await this.rootNameRep.getMostPopularIds(this.container.id, this.limit, this.skip, this.minCountWords);

        if (rootIds.length === 0) {
            if (this.minCountWords === START_MIN_COUNT_WORDS) {
                this.minCountWords = 1;
                this.reset();
                return this.next();
            }
            this.end = true;
            return [];
        }
        this.skip += this.limit;

        this.currentRootIds = rootIds;
        this.currentIndex = 0;

        return await this.getConceptNames(this.currentRootIds[this.currentIndex++]);
    }

    async getConceptNames(rootId: string): Promise<string[]> {
        if (!rootId) {
            throw new Error(`Invalid rootId`);
        }
        const rootName = await this.rootNameRep.getById(rootId);
        const concepts = await this.conceptRep.getByRootNameId(rootId);
        const names = ConceptHelper.getConceptsNames(concepts, this.options.rootNames);
        if (rootName && names.indexOf(rootName.name) < 0) {
            names.push(rootName.name);
        }

        return names;
    }
}
