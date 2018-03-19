import { ExploreWikiEntities } from "./exploreWikiEntities";
import { BuildActor } from "./buildActor";
import { FindWikiTitles } from "./findWikiTitles";
import { GetPopularConceptNode } from "./getPopularConceptNode";
import { SaveWikiEntities } from "./saveWikiEntities";
import { DeleteActorConcepts } from "./deleteActorConcepts";

export {
    ExploreWikiEntities,
    BuildActor,
    FindWikiTitles,
    GetPopularConceptNode,
    SaveWikiEntities,
    DeleteActorConcepts,
}

export type GeneratorActions = {
    exporeWikiEntities?: ExploreWikiEntities
    buildActor?: BuildActor
    findWikiTitles?: FindWikiTitles
    getPopularConceptNode?: GetPopularConceptNode
    saveWikiEntities?: SaveWikiEntities
    deleteActorConcepts?: DeleteActorConcepts
}
