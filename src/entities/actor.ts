import { IWikiEntity } from "./wikiEntity";
import { IConcept } from "./concept";



export interface IActor {
    id: string
    lang: string
    country: string
    slug: string
    name: string
    names?: string[]
    shortName?: string
    abbr?: string
    
    wikiEntity?: IWikiEntity
    concepts?: IConcept[]
}
