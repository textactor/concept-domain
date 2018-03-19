
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
    minConceptPopularity?: number
    minAbbrConceptPopularity?: number
    minOneWordConceptPopularity?: number
}

export class ActorsGenerator extends EventEmitter implements IActorsGenerator {

    private started = false;
    private ended = false;
    private actions: GeneratorActions = {}

    constructor(private locale: ILocale, private repos: Repositories, private options?: ActorsGeneratorOptions) {
        super()

        this.options = Object.assign({
            minConceptPopularity: 10,
            minAbbrConceptPopularity: 20,
            minOneWordConceptPopularity: 20,
        }, options);

        this.actions.buildActor = new BuildActor(this.locale, this.repos.wikiEntity, this.repos.concept);
        this.actions.exporeWikiEntities = new ExploreWikiEntities(this.locale);
        this.actions.findWikiTitles = new FindWikiTitles(this.locale);
        this.actions.getPopularConceptNode = new GetPopularConceptNode(this.locale, this.repos.concept);
        this.actions.saveWikiEntities = new SaveWikiEntities(this.repos.wikiEntity);
        this.actions.deleteActorConcepts = new DeleteActorConcepts(this.repos.concept);
    }

    async start() {
        if (this.ended) {
            return this.emitError(new Error(`Generator is expired`));
        }
        if (this.started) {
            return this.emitError(new Error(`Generator is started`));
        }

        this.started = true;

        try {
            await this.repos.concept.deleteUnpopular(this.locale, this.options.minConceptPopularity);
            await this.repos.concept.deleteUnpopularAbbreviations(this.locale, this.options.minAbbrConceptPopularity);
            await this.repos.concept.deleteUnpopularOneWorlds(this.locale, this.options.minOneWordConceptPopularity);
        } catch (e) {
            this.emitError(e);
            this.emitEnd();
            return;
        }

        let actor: IActor;

        while (true) {
            try {
                const node = await this.actions.getPopularConceptNode.execute(null);

                if (!node) {
                    await this.repos.concept.deleteAll(this.locale);
                    this.emitEnd();
                    return;
                }

                const names = GetPopularConceptNode.getTopConceptsNames(node, 2);

                const wikiTitles = await this.actions.findWikiTitles.execute(names);

                if (wikiTitles.length) {
                    const wikiEntities = await this.actions.exporeWikiEntities.execute(wikiTitles)
                    await this.actions.saveWikiEntities.execute(wikiEntities);
                }

                actor = await this.actions.buildActor.execute(node);
                await this.actions.deleteActorConcepts.execute(actor);

            } catch (e) {
                this.emitError(e);
                this.emitEnd();
                return;
            }

            this.emitActor(actor);
        }
    }

    private emitActor(actor: IActor) {
        this.emit('actor', actor);
    }

    private emitEnd() {
        this.emit('end');
    }

    private emitError(error: Error) {
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
