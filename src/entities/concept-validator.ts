import { JoiEntityValidator } from "@textactor/domain";
import * as Joi from 'joi';
import { Concept } from "./concept";

export class ConceptValidator extends JoiEntityValidator<Concept>{
    constructor() {
        super({ createSchema, updateSchema })
    }
}


const schema = {
    id: Joi.string().regex(/^[a-zA-Z0-9_-]{6,32}$/),
    lang: Joi.string().regex(/^[a-z]{2}$/),
    country: Joi.string().regex(/^[a-z]{2}$/),
    name: Joi.string().min(2).max(200).trim(),
    knownName: Joi.string().min(2).max(200).trim(),
    nameLength: Joi.number().integer().min(2),
    rootNameIds: Joi.array().items(Joi.string().trim().min(16).max(40).required()).min(1),
    abbr: Joi.string().min(2).max(50),
    popularity: Joi.number().integer().min(1),
    isAbbr: Joi.boolean(),
    isIrregular: Joi.boolean(),
    endsWithNumber: Joi.boolean(),
    context: Joi.string().max(500).truncate(),
    containerId: Joi.string().regex(/^[a-zA-Z0-9_-]{6,32}$/),

    createdAt: Joi.date().timestamp('unix').raw(),
    updatedAt: Joi.date().timestamp('unix').raw(),
    expiresAt: Joi.date().timestamp('unix').raw(),
}

const createSchema = Joi.object().keys({
    id: schema.id.required(),
    lang: schema.lang.required(),
    country: schema.country.required(),
    name: schema.name.required(),
    knownName: schema.knownName,
    nameLength: schema.nameLength.required(),
    rootNameIds: schema.rootNameIds.required(),
    abbr: schema.abbr,
    popularity: schema.popularity.required(),
    isAbbr: schema.isAbbr.required(),
    isIrregular: schema.isIrregular.required(),
    endsWithNumber: schema.endsWithNumber.required(),
    context: schema.context,
    containerId: schema.containerId.required(),

    createdAt: schema.createdAt.required(),
    updatedAt: schema.updatedAt,
    expiresAt: schema.expiresAt.required(),
});

const updateSchema = Joi.object().keys({
    id: schema.id.required(),
    set: Joi.object().keys({
        knownName: schema.knownName,
        rootNameIds: schema.rootNameIds,
        abbr: schema.abbr,
        popularity: schema.popularity,
        context: schema.context,
        updatedAt: schema.updatedAt,
        expiresAt: schema.expiresAt,
    }),
    delete: Joi.array().valid('context', 'knownName', 'abbr'),
});
