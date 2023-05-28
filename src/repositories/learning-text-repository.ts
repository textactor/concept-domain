import { Repository } from "@textactor/domain";
import { LearningText } from "../entities/learning-text";

export type LearningTextListParams = {
  lang: string;
  country: string;
  limit: number;
  skip?: number;
};

export interface LearningTextRepository extends Repository<LearningText> {
  list(params: LearningTextListParams): Promise<LearningText[]>;
  put(data: LearningText): Promise<LearningText>;
}
