
import { ObjectID } from 'mongodb'


export const ID = '_id'

export const isId = (key) => key === ID

export const parseValue = (key, value) => (!isId(key) ? value : ObjectID(value))

export const removeId = (object) => {
    const {[ID]: _, ...noIdObject } = object
    return noIdObject
}

export const isValidProperty = (key, value) => !isId(key) || ObjectID.isValid(value)

export const propHasRef = (schema, key) => schema[key].hasOwnProperty('ref') || (Array.isArray(schema[key]) && schema[key][0].hasOwnProperty('ref'))