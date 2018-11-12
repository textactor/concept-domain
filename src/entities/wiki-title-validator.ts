import { JoiEntityValidator } from "@textactor/domain";
import * as Joi from 'joi';
import { WikiTitle } from "./wiki-title";

export class WikiTitleValidator extends JoiEntityValidator<WikiTitle>{
    constructor() {
        super({ createSchema, updateSchema })
    }
}


const schema = {
    id: Joi.string().regex(/^[a-zA-Z0-9_-]{32,40}$/),
    lang: Joi.string().regex(/^[a-z]{2}$/),
    country: Joi.string().regex(/^[a-z]{2}$/),
    title: Joi.string().min(2).max(200).trim(),

    createdAt: Joi.date().timestamp('unix').raw(),
    updatedAt: Joi.date().timestamp('unix').raw(),
    expiresAt: Joi.date().timestamp('unix').raw(),
}

const createSchema = Joi.object().keys({
    id: schema.id.required(),
    lang: schema.lang.required(),
    country: schema.country.required(),
    title: schema.title.required(),

    createdAt: schema.createdAt.required(),
    updatedAt: schema.updatedAt,
    expiresAt: schema.expiresAt.required(),
});

const updateSchema = Joi.object().keys({
    id: schema.id.required(),
    set: Joi.object().keys({
        updatedAt: schema.updatedAt,
        expiresAt: schema.expiresAt,
    }),
    delete: Joi.array().valid(),
});
