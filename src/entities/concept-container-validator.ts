import { JoiEntityValidator } from "@textactor/domain";
import { ConceptContainer, ConceptContainerStatusKeys } from "./concept-container";
import * as Joi from 'joi';

export class ConceptContainerValidator extends JoiEntityValidator<ConceptContainer>{
    constructor() {
        super({ createSchema, updateSchema })
    }
}


const schema = {
    id: Joi.string().regex(/^[a-zA-Z0-9_-]{6,32}$/),
    lang: Joi.string().regex(/^[a-z]{2}$/),
    country: Joi.string().regex(/^[a-z]{2}$/),
    name: Joi.string().min(2).max(200).trim(),
    uniqueName: Joi.string().min(2).max(200).trim(),
    status: Joi.string().valid(ConceptContainerStatusKeys),
    ownerId: Joi.string().min(1).max(50).trim(),
    lastError: Joi.string().max(800).trim().truncate(),
    createdAt: Joi.date().timestamp('unix').raw(),
    updatedAt: Joi.date().timestamp('unix').raw(),
    expiresAt: Joi.date().timestamp('unix').raw(),
}

const createSchema = Joi.object().keys({
    id: schema.id.required(),
    lang: schema.lang.required(),
    country: schema.country.required(),
    name: schema.name.required(),
    uniqueName: schema.uniqueName.required(),
    status: schema.status.required(),
    ownerId: schema.ownerId.required(),
    lastError: schema.lastError,
    createdAt: schema.createdAt.required(),
    updatedAt: schema.updatedAt,
    expiresAt: schema.expiresAt.required(),
}).required();

const updateSchema = Joi.object().keys({
    id: schema.id.required(),
    set: Joi.object().keys({
        status: schema.status,
        lastError: schema.lastError,
        updatedAt: schema.updatedAt,
        expiresAt: schema.expiresAt,
    }),
    delete: Joi.array().valid('lastError'),
}).or('set', 'delete').required();
