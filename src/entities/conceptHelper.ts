
import { md5, rootName } from '../utils';
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
        const id = ConceptHelper.hash(normalText, lang, country);

        const textHash = ConceptHelper.hash(NameHelper.atonic(normalText), lang, country)

        const isAbbr = NameHelper.isAbbr(text);
        const countWords = text.split(/\s+/g).length;
        const isIrregular = NameHelper.isIrregular(text);
        const endsWithNumber = NameHelper.endsWithNumberWord(text);

        let abbr: string
        if (data.abbr) {
            abbr = data.abbr.trim();
        }

        let rootText = text;
        let normalRootText = normalText;
        let rootTextHash = textHash;

        if (!(isAbbr || countWords === 1)) {
            rootText = rootName(text, lang);
            normalRootText = ConceptHelper.normalizeName(rootText, lang);
            rootTextHash = ConceptHelper.hash(NameHelper.atonic(normalRootText), lang, country);
        }

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
            abbr,
            rootText,
            normalRootText,
            rootTextHash,
            popularity,
        }
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

    public static hash(text: string, lang: string, country: string) {
        return md5([lang.trim().toLowerCase(), country.trim().toLowerCase(), text.trim()].join('_'))
    }
}
