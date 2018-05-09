import { ConceptContainer } from "./conceptContainer";
import { generate as generateNewId } from 'shortid';

export type ConceptContainerData = {
    lang: string
    country: string
    name: string
    uniqueName: string
    ownerId?: string
}

export class ConceptContainerHelper {
    static build(data: ConceptContainerData): ConceptContainer {
        const container: ConceptContainer = {
            id: generateNewId(),
            name: data.name,
            uniqueName: data.uniqueName,
            lang: data.lang,
            country: data.country,
        };

        if (data.ownerId) {
            container.ownerId = data.ownerId;
        }

        return container;
    }
}
