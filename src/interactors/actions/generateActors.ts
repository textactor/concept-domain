
import { UseCase } from '@textactor/domain';
import { IWikiEntityRepository } from '../wikiEntityRepository';
import { IConceptRepository } from '../conceptRepository';
import { ConceptActor } from '../../entities/actor';
import { BuildActor } from './buildActor';
import { DeleteActorConcepts } from './deleteActorConcepts';
import { IConceptRootNameRepository } from '../conceptRootNameRepository';
import { ConceptContainer } from '../../entities/conceptContainer';

export interface OnGenerateActorCallback {
    (actor: ConceptActor): Promise<any>
}

export class GenerateActors extends UseCase<OnGenerateActorCallback, void, void> {
    private minCountWords = 2
    private buildActor: BuildActor
    private deleteActorConcepts: DeleteActorConcepts

    constructor(private container: ConceptContainer,
        private conceptRep: IConceptRepository,
        private rootNameRep: IConceptRootNameRepository,
        wikiEntityRep: IWikiEntityRepository) {
        super()

        this.buildActor = new BuildActor(container, wikiEntityRep, conceptRep);
        this.deleteActorConcepts = new DeleteActorConcepts(conceptRep, rootNameRep);
    }

    protected async innerExecute(callback: OnGenerateActorCallback): Promise<void> {
        let actor: ConceptActor;

        while (true) {
            try {
                const rootId = await this.getNextPopularRootId();

                if (!rootId) {
                    await this.conceptRep.deleteAll(this.container.id);
                    await this.rootNameRep.deleteAll(this.container.id);
                    return;
                }
                actor = await this.buildActor.execute(rootId);
                if (actor) {
                    await this.deleteActorConcepts.execute(actor);
                } else {
                    await this.rootNameRep.deleteIds([rootId]);
                }

            } catch (e) {
                return Promise.reject(e);
            }

            if (callback && actor) {
                await callback(actor);
            }
        }
    }

    private async getNextPopularRootId(): Promise<string> {
        const rootIds = await this.rootNameRep.getMostPopularIds(this.container.id, 1, 0, this.minCountWords);

        if (rootIds.length < 1) {
            if (this.minCountWords === 1) {
                return null;
            }
            this.minCountWords = 1;
            return this.getNextPopularRootId();
        }

        return rootIds[0];
    }
}
