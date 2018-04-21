
import { NameHelper, md5, uniq } from '@textactor/domain';
import { Concept } from './concept';
import * as isAbbrOf from 'is-abbr-of';
import { RootNameHelper } from './rootNameHelper';
import { getConceptKnownName } from './conceptKnownNames';

export type CreatingConceptData = {
    lang: string
    country: string
    name: string
    abbr?: string
    knownName?: string
    context?: string
}

export class ConceptHelper {

    static create(data: CreatingConceptData): Concept {

        const lang = data.lang.trim().toLowerCase();
        const country = data.country.trim().toLowerCase();
        const name = data.name.trim();
        const nameLength = name.length;

        const normalName = NameHelper.normalizeName(name, lang);
        const id = ConceptHelper.id(normalName, lang, country);

        const nameHash = ConceptHelper.nameHash(normalName, lang, country);

        const isAbbr = NameHelper.isAbbr(name);
        const countWords = NameHelper.countWords(name);
        const isIrregular = NameHelper.isIrregular(name);
        const endsWithNumber = NameHelper.endsWithNumberWord(name);
        const rootNameId = RootNameHelper.idFromName(name, lang, country);

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
            rootNameId,
            popularity,
            context: data.context,
        };

        if (data.knownName) {
            concept.knownName = data.knownName;
        } else {
            const knownName = getConceptKnownName(name, lang, country);
            if (knownName) {
                concept.knownName = knownName;
            }
        }

        return concept;
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
        const { lang } = concepts[0];
        let conceptNames = concepts.map(item => item.knownName).filter(name => !!name);
        conceptNames = conceptNames.concat(concepts.map(item => item.name));
        conceptNames = conceptNames.concat(concepts.reduce<string[]>((list, concept) => {
            if (concept.isAbbr) {
                list = list.concat(concept.abbrLongNames || [])
                list = list.concat(concept.contextNames || [])
            }
            return list;
        }, []));

        conceptNames = conceptNames.filter(name => ConceptHelper.isValidName(name, lang));

        if (rootNames) {
            conceptNames = conceptNames.concat(conceptNames.map(name => RootNameHelper.rootName(name, lang)));
            conceptNames = conceptNames.filter(name => ConceptHelper.isValidName(name, lang));
        }

        conceptNames = uniq(conceptNames);

        return conceptNames;
    }

    static isValidName(name: string, lang: string) {
        return name && name.trim().length > 1 && NameHelper.normalizeName(name, lang).length > 1;
    }

    static isValid(concept: Concept) {
        return ConceptHelper.isValidName(concept.name, concept.lang);
    }
}
