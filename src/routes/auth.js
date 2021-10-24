import {
    login,
    logout,
    amIAdmin,
    verifyToken 
} from '../controllers/Auth'


export const authRoutes = [
    {
        method: 'post',
        url: '/api/login',
        fn: login
    },
    {
        method: 'post',
        url: '/api/logout',
        fn: logout
    },
    {
        method: 'get',
        url: '/api/amIAdmin',
        fn: amIAdmin
    },
    {
        method: 'post',
        url: '/api/verifyToken',
        fn: verifyToken
    }
]