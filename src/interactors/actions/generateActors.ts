
import { UseCase } from '@textactor/domain';
import { Locale } from '../../types';
import { IWikiEntityRepository } from '../wikiEntityRepository';
import { IConceptRepository } from '../conceptRepository';
import { ConceptActor } from '../../entities/actor';
import { BuildActor } from './buildActor';
import { GetPopularConceptNode } from './getPopularConceptNode';
import { DeleteActorConcepts } from './deleteActorConcepts';

export interface OnGenerateActorCallback {
    (actor: ConceptActor): Promise<any>
}

export class GenerateActors extends UseCase<OnGenerateActorCallback, void, void> {
    private buildActor: BuildActor
    private getPopularConceptNode: GetPopularConceptNode
    private deleteActorConcepts: DeleteActorConcepts

    constructor(private locale: Locale, private conceptRepository: IConceptRepository, private wikiEntityRepository: IWikiEntityRepository) {
        super()

        this.buildActor = new BuildActor(this.locale, this.wikiEntityRepository, this.conceptRepository);
        this.getPopularConceptNode = new GetPopularConceptNode(this.locale, this.conceptRepository);
        this.deleteActorConcepts = new DeleteActorConcepts(this.conceptRepository);
    }

    protected async innerExecute(callback: OnGenerateActorCallback): Promise<void> {
        let actor: ConceptActor;

        while (true) {
            try {
                const node = await this.getPopularConceptNode.execute(null);

                if (!node) {
                    await this.conceptRepository.deleteAll(this.locale);
                    return;
                }

                actor = await this.buildActor.execute(node);
                await this.deleteActorConcepts.execute(actor);

            } catch (e) {
                return Promise.reject(e);
            }

            if (callback) {
                await callback(actor);
            }
        }
    }
}
