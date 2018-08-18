const Karbon14Token = artifacts.require('Karbon14Token')
const { TOKEN_NAME, TOKEN_TICKER, TOKEN_DECIMALS } = require('../config.json')

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(Karbon14Token, TOKEN_NAME, TOKEN_TICKER, TOKEN_DECIMALS)
}
