
import { ILocale } from "../../types";
import { IConceptRepository } from "../conceptRepository";
import { IWikiEntityRepository } from "../wikiEntityRepository";
import { IActor } from "../..";
import { EventEmitter } from "events";
import { GeneratorActions, BuildActor, ExploreWikiEntities, FindWikiTitles, GetPopularConceptNode, SaveWikiEntities, DeleteActorConcepts } from "./actions";

export interface IActorsGenerator {
    onActor(callback: (actor: IActor) => void): void
    onEnd(callback: () => void): void
    onError(callback: (error: Error) => void): void
    start(): void
}

export type Repositories = {
    concept: IConceptRepository,
    wikiEntity: IWikiEntityRepository,
}

export interface ActorsGeneratorOptions {
    limit?: number
}

export class ActorsGenerator extends EventEmitter implements IActorsGenerator {

    private started = false;
    private ended = false;
    private actions: GeneratorActions = {}

    constructor(private locale: ILocale, private repos: Repositories) {
        super()

        this.actions.buildActor = new BuildActor(this.locale, this.repos.wikiEntity, this.repos.concept);
        this.actions.exporeWikiEntities = new ExploreWikiEntities(this.locale);
        this.actions.findWikiTitles = new FindWikiTitles(this.locale);
        this.actions.getPopularConceptNode = new GetPopularConceptNode(this.locale, this.repos.concept);
        this.actions.saveWikiEntities = new SaveWikiEntities(this.repos.wikiEntity);
        this.actions.deleteActorConcepts = new DeleteActorConcepts(this.repos.concept);
    }

    start() {
        if (this.ended) {
            return this.emitError(new Error(`Generator is expired`));
        }
        if (this.started) {
            return this.emitError(new Error(`Generator is started`));
        }

        this.started = true;

        this.actions.getPopularConceptNode.execute(null)
            .then(node => {
                if (!node) {
                    this.emitEnd();
                    return;
                }
                const names = GetPopularConceptNode.getTopConceptsNames(node, 2);

                return this.actions.findWikiTitles.execute(names)
                    .then(wikiTitles => {
                        if (wikiTitles.length) {
                            return this.actions.exporeWikiEntities.execute(wikiTitles)
                                .then(wikiEntities => this.actions.saveWikiEntities.execute(wikiEntities))
                        }
                    })
                    .then(_ => this.actions.buildActor.execute(node))
                    .then(actor => this.actions.deleteActorConcepts.execute(actor))
                    .then(actor => this.emitActor(actor));
            })
            .catch(error => {
                this.emitError(error);
                this.emitEnd();
            });
    }

    emitActor(actor: IActor) {
        this.emit('actor', actor);
    }

    emitEnd() {
        this.emit('end');
    }

    emitError(error: Error) {
        this.emit('error', error);
    }

    onActor(callback: (actor: IActor) => void): void {
        this.on('actor', callback);
    }
    onError(callback: (error: Error) => void): void {
        this.on('error', callback);
    }

    onEnd(callback: (error: Error) => void) {
        this.on('end', callback);
    }
}
