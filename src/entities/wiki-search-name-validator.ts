import { JoiEntityValidator } from "@textactor/domain";
import * as Joi from 'joi';
import { WikiSearchName } from "./wiki-search-name";

export class WikiSearchNameValidator extends JoiEntityValidator<WikiSearchName>{
    constructor() {
        super({ createSchema, updateSchema })
    }
}


const schema = {
    id: Joi.string().regex(/^[a-zA-Z0-9_-]{32,40}$/),
    lang: Joi.string().regex(/^[a-z]{2}$/),
    country: Joi.string().regex(/^[a-z]{2}$/),
    name: Joi.string().min(2).max(200).trim(),

    createdAt: Joi.date().timestamp('unix').raw(),
    updatedAt: Joi.date().timestamp('unix').raw(),
    expiresAt: Joi.date().timestamp('unix').raw(),
}

const createSchema = Joi.object().keys({
    id: schema.id.required(),
    lang: schema.lang.required(),
    country: schema.country.required(),
    name: schema.name.required(),

    createdAt: schema.createdAt.required(),
    updatedAt: schema.updatedAt,
    expiresAt: schema.expiresAt.required(),
}).required();

const updateSchema = Joi.object().keys({
    id: schema.id.required(),
    set: Joi.object().keys({
        updatedAt: schema.updatedAt,
        expiresAt: schema.expiresAt,
    }),
    delete: Joi.array().valid(),
}).or('set', 'delete').required();
