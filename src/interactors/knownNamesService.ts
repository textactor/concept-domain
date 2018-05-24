export interface IKnownNameService {
    getKnownName(name: string, lang: string, country: string): KnownName
}

export type KnownName = {
    name: string
    countryCodes?: string[]
}
