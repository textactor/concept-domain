
export function getConceptKnownName(name: string, lang: string, country: string): string {
    const knownNames = KNOWN_NAMES[lang] && KNOWN_NAMES[lang][country];

    if (knownNames) {
        for (let kname of knownNames) {
            if (kname.reg.test(name)) {
                return kname.name;
            }
        }
    }
}

type KnownName = {
    reg: RegExp
    name: string
}

const KNOWN_NAMES: { [lang: string]: { [country: string]: KnownName[] } } = {
    ro: {
        md: [
            {
                reg: /^(Moldova|Moldovei)$/,
                name: 'Republica Moldova'
            },
            {
                reg: /^(MAI|Ministerul\w* de Interne)$/,
                name: 'Ministerul Afacerilor Interne'
            },
            {
                reg: /^(MAE|Ministerul\w* de Externe)$/,
                name: 'Ministerul Afacerilor Externe'
            }
        ]
    }
}
