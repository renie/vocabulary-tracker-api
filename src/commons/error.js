const ThrowError = (message, {meta}) => {
    logger.error(message, { meta })
    const error = Error(message)
    error.meta = {...meta}
    throw error
}

export default ThrowError