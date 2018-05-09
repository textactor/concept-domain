
export enum ConceptContainerStatus {
    NEW = 'NEW',
    COLLECTING = 'COLLECTING',
    COLLECT_DONE = 'COLLECT_DONE',
    COLLECT_ERROR = 'COLLECT_ERROR',
    GENERATING = 'GENERATING',
    GENERATE_ERROR = 'GENERATE_ERROR',
    EMPTY = 'EMPTY',
}

export type ConceptContainer = {
    id: string
    lang?: string
    country?: string

    name?: string
    uniqueName?: string

    ownerId?: string

    status?: ConceptContainerStatus

    lastError?: string

    createdAt?: number
    updatedAt?: number
}
