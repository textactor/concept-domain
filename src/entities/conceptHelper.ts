
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

        const partialName = getPartialName(name, { lang });
        if (partialName && NameHelper.countWords(partialName) > 1) {
            concept.partialName = partialName;
            concept.partialNameHash = ConceptHelper.nameHash(concept.partialName, lang, country);
        }

        return concept;
    }

    public static rootName(name: string, lang: string) {
        lang = lang.trim();
        name = name.trim();

        const isAbbr = NameHelper.isAbbr(name);
        const countWords = NameHelper.countWords(name);

        if (isAbbr || countWords === 1) {
            return name;
        }
        return NameHelper.rootName(name, lang);
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
