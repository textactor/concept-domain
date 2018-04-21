
export type Concept = {
    id: string
    lang?: string
    country?: string

    name?: string
    nameLength?: number
    /** normalized text hash */
    nameHash?: string
    normalName?: string
    rootNameId?: string

    abbr?: string
    abbrLongNames?: string[]

    popularity?: number
    countWords?: number
    endsWithNumber?: boolean
    isIrregular?: boolean
    isAbbr?: boolean
    createdAt?: number

    contextNames?: string[]

    knownName?: string

    context?: string
}
