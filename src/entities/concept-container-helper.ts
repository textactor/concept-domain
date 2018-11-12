import { ConceptContainer, ConceptContainerStatus } from "./concept-container";
import { generate as generateNewId } from 'shortid';
import { unixTime } from '@textactor/domain';

export type BuildConceptContainerParams = {
    lang: string
    country: string
    name: string
    uniqueName: string
    ownerId: string
    createdAt?: Date
}

export class ConceptContainerHelper {
    static build(params: BuildConceptContainerParams): ConceptContainer {
        const createdAt = unixTime(params.createdAt);
        const expiresAt = ConceptContainerHelper.createExpiresAt(createdAt);

        const container: ConceptContainer = {
            id: ConceptContainerHelper.newId(),
            status: ConceptContainerStatus.NEW,
            name: params.name,
            uniqueName: params.uniqueName,
            lang: params.lang,
            country: params.country,
            ownerId: params.ownerId,
            createdAt,
            expiresAt,
        };

        return container;
    }

    public static createExpiresAt(createdAt: number) {
        const TTL = 86400 * 15 // 15 days

        return createdAt + TTL;
    }

    public static getExpiresAtFieldName() {
        return 'expiresAt';
    }

    static newId() {
        return generateNewId();
    }

    static validate(entity: ConceptContainer | null | undefined) {
        if (!entity) {
            throw new Error(`Invalid ConceptContainer: null or undefined`);
        }

        if (!entity.id || entity.id.trim().length < 2) {
            throw new Error(`Invalid ConceptContainer: invalid id`);
        }

        if (!entity.lang) {
            throw new Error(`Invalid ConceptContainer: invalid lang`);
        }

        if (!entity.country) {
            throw new Error(`Invalid ConceptContainer: invalid country`);
        }

        if (!entity.name) {
            throw new Error(`Invalid ConceptContainer: invalid name`);
        }
        if (!entity.uniqueName) {
            throw new Error(`Invalid ConceptContainer: invalid uniqueName`);
        }
        if (!entity.ownerId) {
            throw new Error(`Invalid ConceptContainer: invalid ownerId`);
        }
        if (!entity.status) {
            throw new Error(`Invalid ConceptContainer: invalid status`);
        }
    }

    static canStartCollect(status: ConceptContainerStatus) {
        return [
            ConceptContainerStatus.NEW
        ].indexOf(status) > -1;
    }

    static canStartGenerate(status: ConceptContainerStatus) {
        return [
            ConceptContainerStatus.COLLECT_DONE,
            ConceptContainerStatus.COLLECT_ERROR,
            ConceptContainerStatus.GENERATE_ERROR,
        ].indexOf(status) > -1;
    }
}
