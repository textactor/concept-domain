import { WikiEntity } from "./wikiEntity";
import { Concept } from "./concept";



export type ConceptActor = {
    id: string
    lang: string
    country: string
    slug: string
    name: string
    names?: string[]
    abbr?: string
    
    wikiEntity?: WikiEntity
    concepts?: Concept[]

    popularity?: number

    partialNames?: string[]
}
