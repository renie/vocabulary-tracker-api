import path from 'path'
import { createLogger, format, transports, config as winstonConfig } from 'winston'
import config from './config'


const { combine, timestamp, printf, json } = format;

const myFormat = printf(({ level, message, timestamp, meta }) => {
    const metaData = meta ? JSON.stringify(meta) : ''
    return `[${level}] [${timestamp}]: ${message} ${metaData}`;
});

const logger = createLogger({
    levels: winstonConfig.syslog.levels,
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        json()
    ),
    transports: [
        new transports.File({ filename: path.join(__dirname, 'logs', 'alert.log'), level: 'alert' }),
        new transports.File({ filename: path.join(__dirname, 'logs', 'error.log'), level: 'error' }),
        new transports.File({ filename: path.join(__dirname, 'logs', 'combined.log'), level: 'notice' }),
        new transports.File({ filename: path.join(__dirname, 'logs', 'combined.log'), level: 'warn' }),
        new transports.File({ filename: path.join(__dirname, 'logs', 'combined.log'), level: 'error' })
    ],
    exitOnError: false
})



export default logger