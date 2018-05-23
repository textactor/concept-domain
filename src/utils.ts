
const debug = require('debug')('textactor:concept-domain');

import rootName from 'root-name';
import { NameHelper } from '@textactor/domain';
import { partialName } from 'partial-name';
import textCountry from 'text-country';

export { rootName as formatRootName }

export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function uniqProp<T>(items: T[], prop: keyof T): T[] {
    const map: { [index: string]: any } = {}
    const list: T[] = []

    for (let item of items) {
        if (map[(<any>item)[prop]] === undefined) {
            map[(<any>item)[prop]] = 1;
            list.push(item)
        }
    }

    return list;
}

export function getPartialName(name: string, lang: string, country: string, entityCountries?: string[]): string {
    if (!name || NameHelper.countWords(name) < 2) {
        return null;
    }

    const exResult = /\(([^)]+)\)$/.exec(name);
    if (exResult) {
        const partial = name.substr(0, exResult.index).trim();
        if (NameHelper.countWords(partial) < 2) {
            return null;
        }
        const specialName = exResult[1];
        const textCountries = textCountry(specialName, lang);
        if (textCountries && textCountries.length && textCountries[0].country === country) {
            debug(`Simple partial name for '${name}'`);
            return partial;
        }
        return null;
    }

    const partial = partialName(name, { lang });
    if (partial && NameHelper.countWords(partial) > 1 && entityCountries && entityCountries.indexOf(country) > -1) {
        return partial;
        // const textCountries = textCountry(name.replace(partial, ''), lang);
        // if (textCountries && textCountries.length && textCountries[0].country === country) {
        //     debug(`Found partial name: '${partial}' for '${name}'`);
        //     return partial;
        // }
    }

    return null;
}

export function isTimeoutError(error: any) {
    return error && error.code && ['ESOCKETTIMEDOUT', 'ETIMEDOUT'].indexOf(error.code) > -1;
}
