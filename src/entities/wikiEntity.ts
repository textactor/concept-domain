
export enum WikiEntityType {
    EVENT = 'E',
    ORG = 'O',
    PERSON = 'H',
    PLACE = 'P',
    PRODUCT = 'R',
}

export type WikiEntityData = { [prop: string]: string[] }

export type WikiEntity = {
    id?: string
    lang?: string
    name?: string
    simpleName?: string
    specialName?: string
    nameHash?: string
    names?: string[]
    namesHashes?: string[]
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

    createdAt?: Date

    /**
     * Permanent redirect to entity id
     */
    redirectId?: string
    partialName?: string
}
