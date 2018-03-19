
import { md5, uniq, eachSeries } from '@textactor/domain';

export { md5, uniq, eachSeries }

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
