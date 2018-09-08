const Karbon14Token = artifacts.require('Karbon14Token')
const { getConfig } = require('../Helpers/getConfig')

module.exports = async (deployer, network) => {
  const { TOKEN_NAME, TOKEN_TICKER, TOKEN_DECIMALS } = getConfig(network)
  await deployer.deploy(Karbon14Token, TOKEN_NAME, TOKEN_TICKER, TOKEN_DECIMALS)
}
