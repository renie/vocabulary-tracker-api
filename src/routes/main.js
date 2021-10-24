import {
    rootRoutes,
    genericErrorFunction
} from './general'
import { verifyToken } from '../controllers/Auth'
import { userRoutes } from './user'
import { authRoutes } from './auth'

export const setRoute = (route, expressInstance, genericErrorFn = genericErrorFunction) => {
    if (route.auth) expressInstance[route.method](route.url, verifyToken, route.fn, route.errorFn || genericErrorFn)
    else expressInstance[route.method](route.url, route.fn, route.errorFn || genericErrorFn)

    return expressInstance
}

export const setAllRoutes = (
    expressInstance,
    routes = [
        ...rootRoutes,
        ...userRoutes,
        ...authRoutes,
    ]
) => {
    routes.forEach((route) => setRoute(route, expressInstance))
    return expressInstance
}