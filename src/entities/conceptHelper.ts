
import { md5, rootName as formatRootName } from '../utils';
import { NameHelper } from '@textactor/domain';
import { IConcept } from './concept';

export interface IConceptText {
    lang: string
    country: string
    text: string
    abbr?: string
}

export class ConceptHelper {

    static create(data: IConceptText): IConcept {

        const lang = data.lang.trim().toLowerCase();
        const country = data.country.trim().toLowerCase();
        const text = data.text.trim();
        const textLength = text.length;

        const normalText = ConceptHelper.normalizeName(text, lang);
        const id = ConceptHelper.id(normalText, lang, country);

        const textHash = ConceptHelper.nameHash(normalText, lang, country);

        const isAbbr = NameHelper.isAbbr(text);
        const countWords = text.split(/\s+/g).length;
        const isIrregular = NameHelper.isIrregular(text);
        const endsWithNumber = NameHelper.endsWithNumberWord(text);

        const rootText = ConceptHelper.rootName(text, lang);
        const normalRootText = ConceptHelper.normalizeName(rootText, lang);
        const rootTextHash = ConceptHelper.nameHash(rootText, lang, country);

        const popularity = 1;

        return {
            id,
            country,
            lang,
            text,
            textLength,
            textHash,
            normalText,
            isAbbr,
            countWords,
            isIrregular,
            endsWithNumber,
            abbr: data.abbr,
            rootText,
            normalRootText,
            rootTextHash,
            popularity,
        }
    }

    public static rootName(name: string, lang: string) {
        const isAbbr = NameHelper.isAbbr(name);
        const countWords = name.split(/\s+/g).length;

        if (isAbbr || countWords === 1) {
            return name;
        }
        return formatRootName(name, lang)
    }

    /**
     * Normalize a name: iPhone 5 => iphone 5; CIA => CIA; Chișinău => chișinău
     * @param name Name to normalize
     * @param lang Language code
     */
    public static normalizeName(name: string, lang: string) {
        name = name.trim().replace(/\s+/g, ' ').trim();
        lang = lang.trim().toLowerCase();
        name = NameHelper.removeSymbols(name);
        name = NameHelper.standardText(name, lang);

        if (NameHelper.isAbbr(name)) {
            return name;
        }

        return name.toLowerCase();
    }

    public static nameHash(name: string, lang: string, country: string) {
        name = name.trim();
        name = ConceptHelper.normalizeName(name, lang);
        name = NameHelper.atonic(name);

        return ConceptHelper.hash(name, lang, country);
    }

    public static hash(name: string, lang: string, country: string) {
        return md5([lang.trim().toLowerCase(), country.trim().toLowerCase(), name.trim()].join('_'))
    }

    public static id(name: string, lang: string, country: string) {
        name = ConceptHelper.normalizeName(name, lang);
        return ConceptHelper.hash(name, lang, country);
    }
}
