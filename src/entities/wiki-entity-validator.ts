import { JoiEntityValidator } from "@textactor/domain";
import * as Joi from 'joi';
import { WikiEntity } from "./wiki-entity";

export class WikiEntityValidator extends JoiEntityValidator<WikiEntity>{
    constructor() {
        super({ createSchema, updateSchema })
    }
}



const schema = {
    id: Joi.string().regex(/^[A-Z]{2}Q\d+$/),
    lang: Joi.string().regex(/^[a-z]{2}$/),
    name: Joi.string().min(2).max(200).trim(),
    simpleName: Joi.string().min(2).max(200).trim(),
    specialName: Joi.string().min(2).max(200).trim(),
    aliases: Joi.array().items(Joi.string().min(2).max(200).trim()).max(50),
    names: Joi.array().items(Joi.string().min(2).max(200).trim().required()).min(1),
    namesHashes: Joi.array().items(Joi.string().trim().min(16).max(40).required()).min(1),
    partialNames: Joi.array().items(Joi.string().min(2).max(200).trim()),
    partialNamesHashes: Joi.array().items(Joi.string().trim().min(16).max(40)),
    abbr: Joi.string().min(2).max(50),
    description: Joi.string().max(200).truncate(),
    about: Joi.string().max(400).truncate(),
    wikiDataId: Joi.string().regex(/^Q\d+$/),
    wikiPageId: Joi.number().integer().min(1),
    wikiPageTitle: Joi.string().min(2).max(200).trim(),
    type: Joi.string().valid(['E', 'O', 'H', 'P', 'R', 'W']),
    types: Joi.array().items(Joi.string().trim().min(2).max(50)).max(50),
    countryCodes: Joi.array().items(Joi.string().regex(/^[a-z]{2}$/)),
    rank: Joi.number().integer().min(1),
    categories: Joi.array().items(Joi.string().trim().min(2).max(200)),
    data: Joi.object(),
    links: Joi.object(),

    createdAt: Joi.date().timestamp('unix').raw(),
    updatedAt: Joi.date().timestamp('unix').raw(),
    expiresAt: Joi.date().timestamp('unix').raw(),
}


const createSchema = Joi.object().keys({
    id: schema.id.required(),
    lang: schema.lang.required(),
    name: schema.name.required(),
    simpleName: schema.simpleName,
    specialName: schema.specialName,
    aliases: schema.aliases,
    names: schema.names.required(),
    namesHashes: schema.namesHashes.required(),
    partialNames: schema.partialNames,
    partialNamesHashes: schema.partialNamesHashes,
    abbr: schema.abbr,
    description: schema.description,
    about: schema.about,
    wikiDataId: schema.wikiDataId.required(),
    wikiPageId: schema.wikiPageId,
    wikiPageTitle: schema.wikiPageTitle,
    type: schema.type,
    types: schema.types,
    countryCodes: schema.countryCodes,
    rank: schema.rank.required(),
    categories: schema.categories,
    data: schema.data,
    links: schema.links.required(),

    createdAt: schema.createdAt.required(),
    updatedAt: schema.updatedAt,
    expiresAt: schema.expiresAt.required(),
});

const updateSchema = Joi.object().keys({
    id: schema.id.required(),
    set: Joi.object().keys({
        simpleName: schema.simpleName,
        specialName: schema.specialName,
        aliases: schema.aliases,
        names: schema.names,
        namesHashes: schema.namesHashes,
        partialNames: schema.partialNames,
        partialNamesHashes: schema.partialNamesHashes,
        abbr: schema.abbr,
        description: schema.description,
        about: schema.about,
        wikiPageId: schema.wikiPageId,
        wikiPageTitle: schema.wikiPageTitle,
        type: schema.type,
        types: schema.types,
        countryCodes: schema.countryCodes,
        rank: schema.rank,
        categories: schema.categories,
        data: schema.data,
        links: schema.links,
        updatedAt: schema.updatedAt,
        expiresAt: schema.expiresAt,
    }),
    delete: Joi.array().valid('simpleName', 'specialName', 'abbr', 'description', 'about', 'type', 'types', 'data', 'categories', 'aliases'),
});
