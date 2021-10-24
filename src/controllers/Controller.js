import { StatusCodes } from 'http-status-codes'
import logger from '../commons/logger'

// PRIVATE
const _doModelSave = async ({req, res, model}) => {
    const objectId = await model.save(req.body)
    res.status(StatusCodes.CREATED).
        set('Location', `${req.route.path}/${objectId}`).
        send({ id: objectId })
}

const _doModelChange = async ({req, res, model}, operationName) => {
    const modelsChanged = (
        operationName === 'remove'
            ? await model[operationName](req.params.id)
            : await model[operationName](req.params.id, req.body)
    )

    modelsChanged
        ? res.status(StatusCodes.NO_CONTENT).send()
        : res.status(StatusCodes.NOT_FOUND).send()
}

const _execChosenOperation = async (params, operation) => (operation === 'save' ? await _doModelSave(params) : await _doModelChange(params, operation))

const _execModelModification = async (params, operation) => {
    try {
        await _execChosenOperation(params, operation)
    } catch (e) {
        console.log(e)
        const reasons = e.meta ? e.meta.err.name.properties : e
        params.res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            message: e.message,
            reasons: [reasons]
        })
    }
}
// PRIVATE END


export const save = async (req, res, model) => await _execModelModification({req, res, model}, 'save')

export const findById = async (req, res, model) => {
    try {
        const object = await model.getOne('_id', req.params.id)
        object ? res.status(StatusCodes.OK).send(object) : res.status(StatusCodes.NOT_FOUND).send()
    } catch (e) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e.message)
    }
}

export const listAll = async (req, res, model) => res.status(StatusCodes.OK).send(await model.getAll(req.query))

export const update = async (req, res, model, full = false) => await _execModelModification({req, res, model}, (full ? 'replace' : 'update'))

export const fullUpdate = async (req, res, model) => await update(req, res, model, true)

export const partialUpdate = async (req, res, model) => await update(req, res, model, false)

export const remove =  async (req, res, model) => await _execModelModification({req, res, model}, 'remove')