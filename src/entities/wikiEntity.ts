
export enum WikiEntityType {
    EVENT = 'E',
    ORG = 'O',
    PERSON = 'H',
    PLACE = 'P',
    PRODUCT = 'R',
}

export type WikiEntityData = { [prop: string]: string[] }

export interface IWikiEntity {
    id?: string
    lang?: string
    name?: string
    names?: string
    abbr?: string
    description?: string
    aliases?: string[]
    about?: string
    wikiDataId?: string
    wikiPageId?: number
    wikiPageTitle?: string
    type?: WikiEntityType
    types?: string[]
    countryCode?: string
    rank?: number
    data?: WikiEntityData
    categories?: string[]
    /**
     * created at timestamp
     */
    createdAt?: number
    /**
     * updated at timestamp
     */
    updatedAt?: number

    /**
     * Permanent redirect to entity id
     */
    redirectId?: string
}
