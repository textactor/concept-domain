
import { NameHelper, md5 } from '@textactor/domain';
import { Concept } from './concept';
import * as isAbbrOf from 'is-abbr-of';
import { partialName as getPartialName } from 'partial-name';

export type CreatingConceptData = {
    lang: string
    country: string
    text: string
    abbr?: string
}

export class ConceptHelper {

    static create(data: CreatingConceptData): Concept {

        const lang = data.lang.trim().toLowerCase();
        const country = data.country.trim().toLowerCase();
        const name = data.text.trim();
        const nameLength = name.length;

        const normalName = ConceptHelper.normalizeName(name, lang);
        const id = ConceptHelper.id(normalName, lang, country);

        const nameHash = ConceptHelper.nameHash(normalName, lang, country);

        const isAbbr = NameHelper.isAbbr(name);
        const countWords = name.split(/\s+/g).length;
        const isIrregular = NameHelper.isIrregular(name);
        const endsWithNumber = NameHelper.endsWithNumberWord(name);

        const rootName = ConceptHelper.rootName(name, lang);
        const normalRootName = ConceptHelper.normalizeName(rootName, lang);
        const rootNameHash = ConceptHelper.nameHash(rootName, lang, country);

        const popularity = 1;

        const concept: Concept = {
            id,
            country,
            lang,
            name,
            nameLength,
            nameHash,
            normalName,
            isAbbr,
            countWords,
            isIrregular,
            endsWithNumber,
            abbr: data.abbr,
            rootName,
            normalRootName,
            rootNameHash,
            popularity,
        };

        const partialName = getPartialName(name, { lang });
        if (partialName && partialName.split(/\s+/g).length > 1) {
            concept.partialName = partialName;
            concept.partialNameHash = ConceptHelper.nameHash(concept.partialName, lang, country);
        }

        return concept;
    }

    public static rootName(name: string, lang: string) {
        lang = lang.trim();
        name = name.trim();

        const isAbbr = NameHelper.isAbbr(name);
        const countWords = name.split(/\s+/g).length;

        if (isAbbr || countWords === 1) {
            return name;
        }
        return NameHelper.rootName(name, lang);
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

    public static setConceptsContextName(concepts: Concept[]) {
        const abbreviations = concepts.filter(item => !!item.isAbbr);
        for (let concept of concepts) {
            if (!concept.isAbbr && concept.countWords > 2 && !concept.endsWithNumber && !concept.abbr) {
                for (let abbr of abbreviations) {
                    if (isAbbrOf(abbr.name, concept.name)) {
                        concept.contextName = concept.contextName || abbr.name;
                        concept.contextNameHash = ConceptHelper.nameHash(concept.contextName, concept.lang, concept.country);

                        abbr.contextName = abbr.contextName || concept.name;
                        abbr.contextNameHash = ConceptHelper.nameHash(abbr.contextName, concept.lang, concept.country);
                    }
                }
            }
        }

        return concepts;
    }
}
