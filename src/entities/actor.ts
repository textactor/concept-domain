
import { WikiEntity } from "./wikiEntity";

export type ConceptActor = {
    lang: string
    country: string
    name: string
    names?: string[]
    
    wikiEntity?: WikiEntity
}
