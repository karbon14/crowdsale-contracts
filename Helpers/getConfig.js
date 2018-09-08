const getConfig = network => {
  try {
    return require(`../config-${network}.json`)
  } catch (e) {
    // eslint-disable-next-line
    console.log(`Config required config-${network}.json`)
    process.exit(0)
  }
}

module.exports = {
  getConfig,
}
