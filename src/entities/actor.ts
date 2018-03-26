import { IWikiEntity } from "./wikiEntity";
import { Concept } from "./concept";



export type ConceptActor = {
    id: string
    lang: string
    country: string
    slug: string
    name: string
    names?: string[]
    shortName?: string
    abbr?: string
    
    wikiEntity?: IWikiEntity
    concepts?: Concept[]

    popularity?: number
    lastname?: string
}
