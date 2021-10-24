import dotenv from 'dotenv'
import path from 'path'

const environment = process.env.NODE_ENV

dotenv.config({ path: path.join(__dirname, '.env') })

const config = {
    PORT: process.env.PORT,
    NODEENV: environment,
    CLUSTER: Boolean(process.env.cluster),
    FRONTENDEVDADDRESS: process.env.FRONTENDEVDADDRESS,
    ADDRESSDB: process.env.ADDRESSDB,
    USERDB: process.env.USERDB,
    PASSDB: process.env.PASSDB,
    NAMEDB: process.env.NAMEDB,
    PARAMSDB: process.env.PARAMSDB,
    SALTROUNDS: process.env.SALTROUNDS,
    SECRETKEYHMAC: process.env.SECRETKEYHMAC,
    JWTDEVTOKEN: process.env.JWTDEVTOKEN || false
}

export default config