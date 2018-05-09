
import { IWriteRepository, IReadRepository } from '@textactor/domain';
import { ConceptContainer, ConceptContainerStatus } from '../entities/conceptContainer';
import { Locale } from '../types';

export interface IConceptContainerWriteRepository extends IWriteRepository<string, ConceptContainer> {

}

export interface IConceptContainerReadRepository extends IReadRepository<string, ConceptContainer> {
    getByStatus(locale: Locale, status: ConceptContainerStatus[]): Promise<ConceptContainer[]>
    list(locale: Locale, limit: number, skip?: number): Promise<ConceptContainer[]>
    count(locale: Locale): Promise<number>
    getByUniqueName(uniqueName: string): Promise<ConceptContainer>
}

export interface IConceptContainerRepository extends IConceptContainerReadRepository, IConceptContainerWriteRepository {

}
