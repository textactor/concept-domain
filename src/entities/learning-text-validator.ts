import { JoiEntityValidator } from "@textactor/domain";
import * as Joi from 'joi';
import { LearningText } from "./learning-text";

export class LearningTextValidator extends JoiEntityValidator<LearningText>{
    constructor() {
        super({ createSchema, updateSchema })
    }
}



const schema = {
    id: Joi.string().alphanum().max(40).min(32),
    lang: Joi.string().regex(/^[a-z]{2}$/),
    country: Joi.string().regex(/^[a-z]{2}$/),
    text: Joi.string().min(100).max(5000).truncate(),

    createdAt: Joi.date().timestamp('unix').raw(),
    expiresAt: Joi.date().timestamp('unix').raw(),
}


const createSchema = Joi.object().keys({
    id: schema.id.required(),
    lang: schema.lang.required(),
    country: schema.country.required(),
    text: schema.text.required(),
    createdAt: schema.createdAt.required(),
    expiresAt: schema.expiresAt.required(),
}).required();

const updateSchema = Joi.object().keys({
    id: schema.id.required(),
    set: Joi.object().keys({
        expiresAt: schema.expiresAt,
    }),
    delete: Joi.array().valid(),
}).or('set', 'delete').required();
