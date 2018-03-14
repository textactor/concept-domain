
import { md5, rootName } from '../utils';
import { NameHelper } from '@textactor/domain';

export interface IConceptText {
    lang: string
    country: string
    text: string
    abbr?: string
}

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
    createdAt?: Date
}

export class Concept implements IConcept {
    id: string;
    lang: string;
    country: string;
    text?: string;
    textLength?: number;
    /** normalized text hash */
    textHash?: string;
    normalText?: string;
    rootText?: string;
    normalRootText?: string;
    /** normalized root text hash */
    rootTextHash?: string;
    abbr?: string;
    popularity?: number;
    countWords?: number;
    endsWithNumber?: boolean;
    isIrregular?: boolean;
    isAbbr?: boolean;
    createdAt?: Date;

    constructor(data: IConceptText) {
        this.lang = data.lang.trim().toLowerCase();
        this.country = data.country.trim().toLowerCase();
        this.text = data.text.trim();
        this.textLength = this.text.length;

        this.normalText = Concept.normalizeName(this.text, this.lang);
        this.id = Concept.hash(this.normalText, this.lang, this.country);

        this.textHash = Concept.hash(NameHelper.atonic(this.normalText), this.lang, this.country)

        this.isAbbr = NameHelper.isAbbr(this.text);
        this.countWords = this.text.split(/\s+/g).length;
        this.isIrregular = NameHelper.isIrregular(this.text);
        this.endsWithNumber = NameHelper.endsWithNumberWord(this.text);

        if (data.abbr) {
            this.abbr = data.abbr.trim();
        }

        if (this.isAbbr || this.countWords === 1) {
            this.rootText = this.text;
            this.normalRootText = this.normalText;
            this.rootTextHash = this.textHash;
        } else {
            this.rootText = rootName(this.text, this.lang);
            this.normalRootText = Concept.normalizeName(this.rootText, this.lang);
            this.rootTextHash = Concept.hash(NameHelper.atonic(this.normalRootText), this.lang, this.country);
        }

        this.popularity = 1;
    }

    public static create(data: IConceptText) {
        return new Concept(data)
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
