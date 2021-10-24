import {
    save,
    listAll,
    findById,
    fullUpdate,
    partialUpdate,
    remove 
} from '../controllers/User'


export const userRoutes = [
    {
        method: 'post',
        url: '/api/user',
        fn: save,
        auth: true
    },
    {
        method: 'get',
        url: '/api/user',
        fn: listAll
    },
    {
        method: 'get',
        url: '/api/user/:id',
        fn: findById,
        auth: true
    },
    {
        method: 'put',
        url: '/api/user/:id',
        fn: fullUpdate,
        auth: true
    },
    {
        method: 'patch',
        url: '/api/user/:id',
        fn: partialUpdate,
        auth: true
    },
    {
        method: 'delete',
        url: '/api/user/:id',
        fn: remove,
        auth: true
    }
]