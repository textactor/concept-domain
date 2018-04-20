import { WikiEntity } from "./wikiEntity";
import { Concept } from "./concept";



export type ConceptActor = {
    lang: string
    country: string
    name: string
    names?: string[]
    
    wikiEntity?: WikiEntity
    concepts?: Concept[]

    popularity?: number
}
