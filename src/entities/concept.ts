
export interface IConcept {
    id: string
    lang: string
    country: string

    text?: string
    textLength?: number
    /** normalized text hash */
    textHash?: string
    normalText?: string;
    rootText?: string
    normalRootText?: string;
    /** normalized root text hash */
    rootTextHash?: string

    abbr?: string

    popularity?: number
    countWords?: number
    endsWithNumber?: boolean
    isIrregular?: boolean
    isAbbr?: boolean
    createdAt?: number
}

