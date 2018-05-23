
import rootName from 'root-name';

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

export function isTimeoutError(error: any) {
    return error && error.code && ['ESOCKETTIMEDOUT', 'ETIMEDOUT'].indexOf(error.code) > -1;
}
