import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from '../commons/config'

import {
    save as genericSave,
    getAll as genericGetAll,
    getOne as genericGetOne,
    replace as genericReplace,
    update as genericUpdate,
    remove as genericRemove } from './model'


export const USER = {
    model: 'User',
    schema: {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        lastUpdate: { type: Date, default: Date.now },
        isLoggedIn: {type: Boolean, default: false},
        loggedInfo: {type: String, default: null},
        isAdmin: {type: Boolean, default: false}
    }
}

export const hashPass = async (user) => {
    if (!user.password) return user

    const userCopy = {...user}
    const salt = await bcrypt.genSalt(Number(config.SALTROUNDS))
    userCopy.password = await bcrypt.hash(userCopy.password, salt)
    return userCopy
}

export const genToken = (user, data) => jwt.sign({
    id: user._id,
    email: user.email,
    ...data
}, config.SECRETKEYHMAC, { expiresIn: 86400 })

export const checkPass = async (user) => {
    const userDoc = await genericGetOne('email', user.email, USER)
    if (!userDoc) ThrowError(`${USER.model} not logged`, { data: user.email})

    const isSamePass = await bcrypt.compare(user.password, userDoc.password)
    if (!isSamePass) ThrowError(`${USER.model} not logged`, { data: user.email})

    return userDoc
}

export const save = async (user) => await genericSave(await hashPass(user), USER)

export const getAll = async (query) => await genericGetAll(query, USER)

export const getOne = async (key, value) => await genericGetOne(key, value, USER)

export const replace = async (id, user) => await genericReplace(id, await hashPass(user), USER)

export const update = async (id, newValues) => await genericUpdate(id, await hashPass(newValues), USER)

export const remove = async (id) => await genericRemove(id, USER)

export default { save, getAll, getOne, replace, update, remove, checkPass, genToken }