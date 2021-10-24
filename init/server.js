import os from 'os'
import cluster from 'cluster'

import config from '../src/commons/config'
import app  from '../app'

const clusterWorkerSize = os.cpus().length

const forkCluster = n => {
    let forkCounter = 0
    
    while (forkCounter < n) {
        cluster.fork()
        forkCounter++
    }
    console.log(`Theres is ${forkCounter} forks in the cluster.`)
}

const forkAllClusters = () => forkCluster(clusterWorkerSize)

const setCluster = () => {
    forkAllClusters()
    cluster.on("exit", worker => console.log("Worker", worker.id, " has exitted."))
}

const putServerToListen = (multiple = false) => {
    const logServerUp = () =>
        console.log(
            multiple
                ? `Express server listening on port ${config.PORT} and worker ${process.pid}`
                : `Express server listening on port ${config.PORT} with the single worker ${process.pid}`)
    
    app.listen(config.PORT, logServerUp)
}

const clusterize = () => cluster.isPrimary ? setCluster() : putServerToListen(true)

const shouldClusterize = () => (clusterWorkerSize > 1 && config.CLUSTER)

const startServer = () => shouldClusterize() ? clusterize() : putServerToListen(false)

module.exports = startServer
