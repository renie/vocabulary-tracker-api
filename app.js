import express from 'express'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import logger from './src/commons/logger'
import error from './src/commons/error'

global.logger = logger
global.ThrowError = error

import config from './src/commons/config'
import { setAllRoutes } from './src/routes/main'

const configureInstance = (expressInstance, corsOptions) => {
    expressInstance.use(bodyParser.json())
    expressInstance.use(helmet())
    expressInstance.use(cookieParser())
    expressInstance.use(cors(corsOptions))

    expressInstance.enable('trust proxy')
    expressInstance.disable('etag')

    return expressInstance
}

const getExpressInstance = () => configureInstance(express(), { origin: config.FRONTENDEVDADDRESS })

const app = setAllRoutes(getExpressInstance())

export default app
