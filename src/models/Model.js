import { getModel, MONGOOSE_ERROR_TYPE } from './db/db'
import { ID, removeId, isValidProperty, parseValue } from '../commons/helpers'
import { _deleteRelatedEntities, _saveNewVersion } from './Model.internals'

export const save = async (objectToSave, entity) =>  {
    const object = removeId(objectToSave)

    try {
        const model = await getModel(entity)
        console.log(objectToSave)
        await model.validate(object)
        const newDocument = await model(object)
        const { _id } = await newDocument.save()
        logger.info(`${entity.model} created`, { meta: _id })
        return _id
    } catch (err) {
        if (err instanceof MONGOOSE_ERROR_TYPE) ThrowError(`${entity.model} not created`, { meta: {object, err: err.errors} })
        ThrowError(`${entity.model} not created`, { meta: {object, err} })
    }
}

export const getAll = async (query, entity) => {
    const model = await getModel(entity)
    return await model.find(query)
}

export const getOne = async (key, value, entity) => {
    if (!isValidProperty(key, value)) return null

    const db = await getModel(entity)
    return await db.findOne({[key]: parseValue(key, value)})
}

export const replace = async (id, newObject, entity) => await _saveNewVersion(id, newObject, entity, 'replace')

export const update = async (id, newValues, entity) => await _saveNewVersion(id, newValues, entity, 'update')

export const remove = async (id, entity, cascade = false) => {
    if (!isValidProperty(ID, id)) return null

    const model = await getModel(entity)
    if (cascade) await _deleteRelatedEntities(id, entity, model)

    const { deletedCount } = await model.deleteOne({[ID]: parseValue(ID, id)})
    logger.info(`${entity.model} deleted`, { meta: id })
    return deletedCount
}