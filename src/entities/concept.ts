
export type Concept = {
    id: string
    lang?: string
    country?: string

    name?: string
    nameLength?: number
    /** normalized text hash */
    nameHash?: string
    normalName?: string;
    rootName?: string
    normalRootName?: string;
    /** normalized root text hash */
    rootNameHash?: string

    abbr?: string
    abbrLongNames?: string[]

    popularity?: number
    countWords?: number
    endsWithNumber?: boolean
    isIrregular?: boolean
    isAbbr?: boolean
    createdAt?: number

    contextNames?: string[]
    // partialName?: string

    // contextNameHash?: string
    // partialNameHash?: string
}
