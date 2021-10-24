import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import sniffer from 'sniffr'

import config from '../commons/config'
import User from "../models/user"

export const login = async (req, res) => {
    try {
        const { wipeOldSessions } = req.body
        const user = await User.checkPass(req.body)

        if (wipeOldSessions) user.isLoggedIn = false

        if (user.isLoggedIn) {
            res.status(StatusCodes.UNAUTHORIZED).send({ type: "LOGGED_USER", message: "User already logged" })
            return false
        }

        const userAgent = (new sniffer()).sniff(req.headers['user-agent'])
        userAgent.ip = req.ip

        const data = {
            os: userAgent.os.name + userAgent.os.version,
            browser: userAgent.browser.name + userAgent.browser.version,
            ip: userAgent.ip
        }

        await User.update(user._id, { isLoggedIn: true, loggedInfo: JSON.stringify(data) })

        const token = User.genToken(user, data)
        res.cookie('token', token, { httpOnly: true })
        res.status(StatusCodes.OK).send({ auth: true })
    } catch {
        res.status(StatusCodes.UNAUTHORIZED).send()
    }
}

export const logout = async (req, res) => {
    const token = req.headers['x-access-token'] || req.cookies.token
    if (!token) return res.status(StatusCodes.UNAUTHORIZED).send({ auth: false, message: 'No token provided.' })

    try {
        const {id} = await jwt.decode(token, config.SECRETKEYHMAC)
        await User.update(id, { isLoggedIn: false, loggedInfo: null })
        res.clearCookie('token')
        res.status(StatusCodes.OK).send({ auth: false, token: null })
    } catch (e) {
        res.status(StatusCodes.BAD_REQUEST).send({ auth: false, token })
    }
}

export const isDevToken = (token) => (config.JWTDEVTOKEN !== false && token === config.JWTDEVTOKEN)

export const checkLoggedInfo = (dbInfo, tokenInfo, userAgent) => (
    dbInfo.os === tokenInfo.os && dbInfo.os === userAgent.os.name + userAgent.os.version &&
    dbInfo.browser === tokenInfo.browser && dbInfo.browser === userAgent.browser.name + userAgent.browser.version &&
    dbInfo.ip === tokenInfo.ip && dbInfo.ip === userAgent.ip
)

export const checkTokenValidity = (dbuser, tokenInfo, req) => {
    const userAgent = (new sniffer()).sniff(req.headers['user-agent'])
    userAgent.ip = req.ip
    return (
        dbuser.logged ||
        checkLoggedInfo(JSON.parse(dbuser.loggedInfo), tokenInfo, userAgent)
    )
}

const _goodTokenRedirect = (url, res, next) => (
    url.includes('verifyToken')
        ? res.status(StatusCodes.OK).send()
        : next()
)

export const verifyToken = async (req, res, next) => {
    const token = req.headers['x-access-token'] || req.cookies.token

    if (!token) return res.status(StatusCodes.UNAUTHORIZED).send({ auth: false, message: 'No token provided.' })
    if (isDevToken(token)) {
        logger.alert(`DEVELOPER JUST LOGGED IN! ENV: ${config.NODEENV} IP: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}.`)
        return _goodTokenRedirect(req.originalUrl, res, next)
    }

    try {
        const { id, os, browser, ip } = await jwt.verify(token, config.SECRETKEYHMAC)
        const user = await User.getOne('_id', id)
        const tokenValid = checkTokenValidity(user, { os, browser, ip}, req)
        if (!tokenValid) return res.status(StatusCodes.UNAUTHORIZED).send({ auth: false, message: 'Failed to authenticate token.' })

        return _goodTokenRedirect(req.originalUrl, res, next)
    } catch {
        res.status(StatusCodes.UNAUTHORIZED).send({ auth: false, message: 'Failed to authenticate token.' })
    }
}

export const amIAdmin = async (req, res) => {
    const token = req.headers['x-access-token'] || req.cookies.token
    if (!token) return res.status(StatusCodes.UNAUTHORIZED).send({ yesYouAre: false })

    try {
        const { id } = await jwt.verify(token, config.SECRETKEYHMAC)
        const { isAdmin } = await User.getOne('_id', id)
        if (!isAdmin) return res.status(StatusCodes.UNAUTHORIZED).send({ yesYouAre: false })
        res.status(StatusCodes.OK).send({ yesYouAre: true })
    } catch {
        res.status(StatusCodes.UNAUTHORIZED).send({ yesYouAre: false })
    }
}