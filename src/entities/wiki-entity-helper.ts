import { WikiEntity } from "./wiki-entity";
import { ConceptHelper } from "./concept-helper";
import { NameHelper, md5, uniq } from "@textactor/domain";

export class WikiEntityHelper {
  public static createId(lang: string, wikiDataId: string) {
    return lang.trim().toUpperCase() + wikiDataId.trim().toUpperCase();
  }

  public static createExpiresAt(createdAt: number) {
    const TTL = 86400 * 15; // 15 days

    return createdAt + TTL;
  }

  public static getExpiresAtFieldName() {
    return "expiresAt";
  }

  static isValidName(name: string | null | undefined, lang: string) {
    return ConceptHelper.isValidName(name, lang);
  }

  static nameHash(name: string, lang: string) {
    lang = lang.trim().toLowerCase();

    name = name.trim();
    name = NameHelper.normalizeName(name, lang);
    name = NameHelper.atonic(name);

    return md5([lang, name].join("_"));
  }

  static namesHashes(names: string[], lang: string) {
    names = names.filter((name) => WikiEntityHelper.isValidName(name, lang));
    const hashes = uniq(
      names.map((name) => WikiEntityHelper.nameHash(name, lang))
    );

    return hashes;
  }

  static rootName(name: string, lang: string) {
    return ConceptHelper.rootName(name, lang);
  }

  static rootNameHash(name: string, lang: string) {
    return WikiEntityHelper.nameHash(
      WikiEntityHelper.rootName(name, lang),
      lang
    );
  }

  static splitName(name: string): { simple: string; special: string } | null {
    const firstIndex = name.indexOf("(");
    if (firstIndex < 3) {
      return null;
    }
    const lastIndex = name.indexOf(")");
    if (lastIndex !== name.length - 1) {
      return null;
    }

    return {
      simple: name.substr(0, firstIndex).trim(),
      special: name.substring(firstIndex + 1, lastIndex)
    };
  }

  static getSimpleName(name: string): string | undefined {
    const splitName = WikiEntityHelper.splitName(name);
    if (splitName) {
      return splitName.simple;
    }
  }

  static isDisambiguation(entity: WikiEntity) {
    return (
      entity &&
      entity.data &&
      entity.data.P31 &&
      entity.data.P31.indexOf("Q4167410") > -1
    );
  }

  static getPopularity(rank: number): EntityPopularity {
    if (!rank || rank < 0) {
      return EntityPopularity.UNKNOWN;
    }
    const r = rank / 10;
    if (r < 2) {
      return EntityPopularity.UNKNOWN;
    }
    if (r < 4) {
      return EntityPopularity.LOW;
    }
    if (r < 6) {
      return EntityPopularity.NORMAL;
    }
    if (r < 9) {
      return EntityPopularity.HIGH;
    }

    return EntityPopularity.POPULAR;
  }

  static isNotActual(entity: WikiEntity): boolean | undefined {
    if (!entity.data) {
      return undefined;
    }
    const notActualProps = ["P457", "P20", "P576"];
    const props = Object.keys(entity.data);
    for (let prop of notActualProps) {
      if (~props.indexOf(prop)) {
        return true;
      }
    }

    return undefined;
  }
}

export enum EntityPopularity {
  UNKNOWN = 1,
  LOW = 2,
  NORMAL = 3,
  HIGH = 4,
  POPULAR = 5
}
