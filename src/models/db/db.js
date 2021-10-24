import mongoose from 'mongoose'

import config from '../../commons/config'
import { propHasRef } from '../../commons/helpers'


let database = false

export const connect = async () => {
    const URI = `mongodb+srv://${config.USERDB}:${config.PASSDB}@${config.ADDRESSDB}/${config.NAMEDB}?${config.PARAMSDB}`

    try {
        database = await mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
    } catch (err) {
        logger.error(err)
        ThrowError('DB Connection Error', { meta: err })
    }
}

export const getConnection = async () => {
    if (database) return database
    await connect()
}

// eslint-disable-next-line func-style
export async function loadSubModels (schema) {
    const schemaCopy = {...schema}
    const propsChanged = await Promise
        .all(Object
            .keys(schema)
            .filter((key) => propHasRef(schema, key))
            .map(async (key) => {
                await getModel(schema[key].ref || schema[key][0].ref)
                return key
            }))

    propsChanged.forEach((key) => {
        const prop = schema[key]
        if (prop.ref) schemaCopy[key].ref = prop.ref
        else schemaCopy[key][0].ref = prop[0].ref.model
    })

    return schemaCopy
}

// eslint-disable-next-line func-style
export async function getModel ({model, schema, collectionName}) {
    await getConnection()
    if (database.models && database.models[model]) return database.models[model]
    const loadedSchema = await loadSubModels(schema)
    return database.models[model] || database.model(model, loadedSchema, collectionName)
}

export const MONGOOSE_ERROR_TYPE = mongoose.Error.ValidationError