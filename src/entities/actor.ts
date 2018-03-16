import { IWikiEntity } from "./wikiEntity";



export interface IActor {
    id: string
    lang: string
    country: string
    slug: string
    name: string
    names: string[]
    shortName?: string
    abbr?: string
    
    wikiEntity?: IWikiEntity
}
