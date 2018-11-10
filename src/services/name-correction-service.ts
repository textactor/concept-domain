
export interface NameCorrectionService {
    correct(name: string, lang: string, country?: string): Promise<string>
}
