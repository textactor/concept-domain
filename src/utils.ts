
import rootName from 'root-name';
import { NameHelper } from '@textactor/domain';
import { partialName } from 'partial-name';

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

export function getPartialName(name: string, lang: string, _country?: string): string {
    if (!name || NameHelper.countWords(name) < 2) {
        return null;
    }

    let partial: string;

    const names = name.split(/\s*[;(]/);
    if (names.length > 1) {
        partial = names[0];
        if (partial && NameHelper.countWords(partial) > 1) {
            return partial;
        }
    }

    // if (country) {
    partial = partialName(name, { lang });
    if (partial && NameHelper.countWords(partial) > 1) {
        return partial;
    }
    // }

    return null;
}
