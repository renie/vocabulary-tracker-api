import { StatusCodes } from 'http-status-codes'

import {
    save as genericSave,
    findById as genericFindById,
    listAll as genericListAll,
    fullUpdate as genericFullUpdate,
    partialUpdate as genericPartialUpdate,
    remove as genericRemove 
} from './controller'
import User from '../models/User'


export const save = async (req, res) => await genericSave(req, res, User)

export const findById = async (req, res) => await genericFindById(req, res, User)

export const listAll = async (req, res) => {
    const list = await User.getAll(req.query)
    const filteredList = list.map(user => ({
        username: user.username,
        isLoggedIn: user.isLoggedIn
    }))
    res.status(StatusCodes.OK).send(filteredList)
}
export const fullUpdate = async (req, res) => await genericFullUpdate(req, res, User)

export const partialUpdate = async (req, res) => await genericPartialUpdate(req, res, User)

export const remove = async (req, res) => await genericRemove(req, res, User)