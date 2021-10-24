import { ID, isValidProperty, parseValue, removeId, propHasRef } from "../commons/helpers"
import { getModel, MONGOOSE_ERROR_TYPE } from "./db/db"

export const _getPropsWithReferences = (schema) => Object
    .keys(schema)
    .filter((key) => propHasRef(schema, key))
    .map((key) => ({ key, prop: schema[key]}))

export const _populateAllRefs = async (refKeys, object) => await Promise
    .all(refKeys
        .map(async (prop) => await object.populate(prop.key).execPopulate()))

export const _removeRelated = async (refKeys, object) => await Promise
    .all(refKeys
        .map((prop) => object[prop.key])
        .map(async (child) => {
            if (Array.isArray(child)) await Promise.all(child.map(async (item) => await item.remove()))
            else await child.remove()
        }))

export const _deleteRelatedEntities = async (id, entity, model) => {
    const object = await model.findOne({[ID]: parseValue(ID, id)})

    const refKeys = _getPropsWithReferences({...entity.schema})
    await _populateAllRefs(refKeys, object)
    await _removeRelated(refKeys, object)

    logger.info(`Children referenced on model ${entity.model} were deleted`, { meta: id })
}

export const _execReplace = async ({object, query, id, model, entity}) => {
    await model.validate(object)
    const { nModified } = await model.replaceOne(query, object)

    if (nModified) {
        await model.updateOne(query, {$currentDate: {lastModified: true}})
        logger.info(`${entity.model} replaced`, {meta: id})
    }

    return nModified
}

export const _execUpdate = async ({object, query, id, model, entity}) => {
    const { nModified } = await model.updateOne(query, {$currentDate: {lastModified: true}, $set: object})
    if (nModified) logger.info(`${entity.model} updated`, {meta: id})
    return nModified
}

export const _execModification = async (params, operation) => (operation === 'replace' ? await _execReplace(params) : await _execUpdate(params))

export const _saveNewVersion = async (id, newThings, entity, operation) => {
    const object = removeId(newThings)

    if (!isValidProperty(ID, id)) return null

    const query = { [ID]: parseValue(ID, id) }

    try {
        const model = await getModel(entity)
        return await _execModification({object, query, id, model, entity}, operation)
    } catch (err) {
        if (err instanceof MONGOOSE_ERROR_TYPE) ThrowError(`${entity.model} not ${operation}d`, { meta: {id, object, err: err.errors} })
        ThrowError(`${entity.model} not ${operation}d`, { meta: {id, object, err} })
    }
}