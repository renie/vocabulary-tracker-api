
export const rootRoutes = [
    {
        method: 'get',
        url: '/api',
        fn: (_, res) => res.append('PID', process.pid).send({'APIRoot':'working'})
    }
]

export const genericErrorFunction = (_, res) => res.status('500').send('Error: Last error layer. We will work on that.')