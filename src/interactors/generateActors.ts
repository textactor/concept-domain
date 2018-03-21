
import { UseCase } from '@textactor/domain';
import { IActor } from '../entities';
import { ILocale } from '../types';
import { IWikiEntityRepository } from './wikiEntityRepository';
import { IConceptRepository } from './conceptRepository';
import { BuildActor, GetPopularConceptNode, DeleteActorConcepts } from './actions';

export interface GenerateActorsParams {
    onActor: (actor: IActor) => void
    onError: (error: Error) => void
}

export class GenerateActors extends UseCase<GenerateActorsParams, void, void> {
    private buildActor:BuildActor
    private getPopularConceptNode:GetPopularConceptNode
    private deleteActorConcepts:DeleteActorConcepts

    constructor(private locale: ILocale, private conceptRepository: IConceptRepository, private wikiEntityRepository: IWikiEntityRepository) {
        super()
        
        this.buildActor = new BuildActor(this.locale, this.wikiEntityRepository, this.conceptRepository);
        this.getPopularConceptNode = new GetPopularConceptNode(this.locale, this.conceptRepository);
        this.deleteActorConcepts = new DeleteActorConcepts(this.conceptRepository);
    }

    protected async innerExecute(params: GenerateActorsParams): Promise<void> {
        let actor: IActor;

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
                if (params.onError) {
                    params.onError(e);
                }
                return Promise.reject(e);
            }

            if (params.onActor) {
                params.onActor(actor);
            }
        }

    }
}