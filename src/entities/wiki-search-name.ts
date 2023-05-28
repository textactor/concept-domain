import { NameHelper, md5, unixTime } from "@textactor/domain";

export type WikiSearchName = {
  id: string;
  lang: string;
  country: string;
  name: string;
  createdAt: number;
  updatedAt?: number;
  expiresAt: number;
};

export type BuildWikiSearchNameParams = {
  lang: string;
  country: string;
  name: string;
  updatedAt?: number;
};

export class WikiSearchNameHelper {
  static build(params: BuildWikiSearchNameParams) {
    const name = params.name.trim();
    const lang = params.lang.trim().toLowerCase();
    const country = params.country.trim().toLowerCase();
    const id = WikiSearchNameHelper.createId(name, lang, country);

    const createdAt = unixTime();
    const expiresAt = WikiSearchNameHelper.createExpiresAt(createdAt);

    const searchName: WikiSearchName = {
      id,
      name,
      lang,
      country,
      createdAt: createdAt,
      updatedAt: params.updatedAt || createdAt,
      expiresAt
    };

    return searchName;
  }

  public static getExpiresAtFieldName() {
    return "expiresAt";
  }

  public static createExpiresAt(createdAt: number) {
    const TTL = 86400 * 4; // 4 days

    return createdAt + TTL;
  }

  static createId(name: string, lang: string, country: string) {
    name = name.trim();
    lang = lang.trim().toLowerCase();
    country = country.trim().toLowerCase();

    const normalName = NameHelper.normalizeName(name, lang);

    if (normalName.length < 2) {
      throw new Error(`Invalid name: ${name}`);
    }

    const hash = md5(normalName);

    return [lang, country, hash].join("");
  }
}
