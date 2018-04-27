
export type Concept = {
    id: string
    lang?: string
    country?: string

    name?: string
    nameLength?: number
    /** normalized text hash */
    nameHash?: string
    normalName?: string
    rootNameIds?: string[]

    abbr?: string
    abbrLongNames?: string[]

    popularity?: number
    countWords?: number
    endsWithNumber?: boolean
    isIrregular?: boolean
    isAbbr?: boolean
    createdAt?: number
    updatedAt?: number

    contextNames?: string[]

    knownName?: string

    context?: string
}
