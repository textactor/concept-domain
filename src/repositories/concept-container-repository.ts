import {
  ConceptContainer,
  ConceptContainerStatus
} from "../entities/concept-container";
import { Locale } from "../types";
import { Repository } from "@textactor/domain";

export type ContainerListFilters = {
  lang: string;
  country: string;
  status?: ConceptContainerStatus[];
  ownerId?: string;
  uniqueName?: string;
  limit: number;
  skip?: number;
};

export interface ConceptContainerRepository
  extends Repository<ConceptContainer> {
  getByStatus(
    locale: Locale,
    status: ConceptContainerStatus[]
  ): Promise<ConceptContainer[]>;
  list(filters: ContainerListFilters): Promise<ConceptContainer[]>;
  count(locale: Locale): Promise<number>;
  getByUniqueName(uniqueName: string): Promise<ConceptContainer | null>;
}
