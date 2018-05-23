
import { UseCase, IUseCase } from '@textactor/domain';
import { IWikiEntityRepository } from '../wikiEntityRepository';
import { ConceptActor } from '../../entities/actor';
import { ConceptContainer } from '../../entities/conceptContainer';
import { INamesEnumerator } from '../namesEnumerator';
import { BuildActorByNames } from './buildActorByNames';

export interface OnGenerateActorCallback {
    (actor: ConceptActor): Promise<any>
}

export class GenerateActors extends UseCase<OnGenerateActorCallback, void, void> {
    private buildActor: BuildActorByNames

    constructor(container: ConceptContainer,
        private namesEnumerator: INamesEnumerator,
        private postNamesProcess: IUseCase<string[], void, void>,
        wikiEntityRep: IWikiEntityRepository) {
        super()

        this.buildActor = new BuildActorByNames(container, wikiEntityRep);
    }

    protected async innerExecute(callback: OnGenerateActorCallback): Promise<void> {
        let actor: ConceptActor;

        while (!this.namesEnumerator.atEnd()) {
            try {
                const names = await this.namesEnumerator.next();
                if (!names || !names.length) {
                    continue;
                }

                actor = await this.buildActor.execute(names);
                if (this.postNamesProcess) {
                    await this.postNamesProcess.execute(names);
                }
                if (actor) {
                    if (this.postNamesProcess) {
                        await this.postNamesProcess.execute(actor.names);
                    }
                }
            } catch (e) {
                return Promise.reject(e);
            }

            if (callback && actor) {
                await callback(actor);
            }
        }
    }
}
