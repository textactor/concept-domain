
import { NameHelper, md5, uniq } from '@textactor/domain';
import { Concept } from './concept';
import * as isAbbrOf from 'is-abbr-of';
import { formatRootName } from '../utils';

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

        const normalName = NameHelper.normalizeName(name, lang);
        const id = ConceptHelper.id(normalName, lang, country);

        const nameHash = ConceptHelper.nameHash(normalName, lang, country);

        const isAbbr = NameHelper.isAbbr(name);
        const countWords = NameHelper.countWords(name);
        const isIrregular = NameHelper.isIrregular(name);
        const endsWithNumber = NameHelper.endsWithNumberWord(name);

        const rootName = ConceptHelper.rootName(name, lang);
        const normalRootName = NameHelper.normalizeName(rootName, lang);
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

        return concept;
    }

    public static rootName(name: string, lang: string) {
        lang = lang.trim();
        name = name.trim();

        const isAbbr = NameHelper.isAbbr(name);

        if (isAbbr) {
            return name;
        }

        if (NameHelper.countWords(name) < 2) {
            return formatRootName(name, lang, { accuracy: 2 });
        }
        
        return formatRootName(name, lang);
    }

    public static nameHash(name: string, lang: string, country: string) {
        name = name.trim();
        name = NameHelper.normalizeName(name, lang);
        name = NameHelper.atonic(name);

        return ConceptHelper.hash(name, lang, country);
    }

    public static hash(name: string, lang: string, country: string) {
        return md5([lang.trim().toLowerCase(), country.trim().toLowerCase(), name.trim()].join('_'))
    }

    public static id(name: string, lang: string, country: string) {
        name = NameHelper.normalizeName(name, lang);
        return ConceptHelper.hash(name, lang, country);
    }

    public static setConceptsContextNames(concepts: Concept[]) {
        const abbreviations = concepts.filter(item => !!item.isAbbr);
        for (let concept of concepts) {
            if (!concept.isAbbr && concept.countWords > 2 && !concept.endsWithNumber && !concept.abbr) {
                for (let abbr of abbreviations) {
                    if (isAbbrOf(abbr.name, concept.name)) {
                        concept.contextNames = concept.contextNames || [];
                        concept.contextNames.push(abbr.name);
                        // concept.contextNameHash = ConceptHelper.nameHash(concept.contextName, concept.lang, concept.country);

                        abbr.contextNames = abbr.contextNames || [];

                        abbr.contextNames.push(concept.name);
                        // abbr.contextNameHash = ConceptHelper.nameHash(abbr.contextName, concept.lang, concept.country);
                    }
                }
            }
        }

        return concepts;
    }

    public static getConceptsNames(concepts: Concept[], rootNames: boolean): string[] {
        const concept = concepts[0];
        const lang = concept.lang;
        let conceptNames = concepts.map(item => item.name);
        conceptNames = conceptNames.concat(concepts.reduce<string[]>((list, concept) => {
            if (concept.isAbbr) {
                list = list.concat(concept.abbrLongNames || [])
                list = list.concat(concept.contextNames || [])
            }
            return list;
        }, []));
        // conceptNames = conceptNames.concat(concepts.map(concept => concept.isAbbr ? concept.contextName : null));
        conceptNames = conceptNames.filter(name => ConceptHelper.isValidName(name));
        if (rootNames) {
            conceptNames = conceptNames.concat(conceptNames.map(name => ConceptHelper.rootName(name, lang)));
        }

        conceptNames = uniq(conceptNames);

        return conceptNames;
    }

    static isValidName(name: string) {
        return name && name.trim().length > 1;
    }
}
