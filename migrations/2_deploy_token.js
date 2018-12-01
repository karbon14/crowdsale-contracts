const Karbon14Token = artifacts.require('Karbon14Token')
const { getConfig } = require('../Helpers/getConfig')

module.exports = async (deployer, network, accounts) => {
  const { TOKEN_NAME, TOKEN_TICKER, TOKEN_DECIMALS, WALLET_ADDRESS, TOKEN_RATE, HARD_CAP, DISTRIBUTION } = getConfig(
    network
  )

  const wallet_address = {
    development: accounts[2],
    ropsten: accounts[0],
    live: WALLET_ADDRESS,
  }

  const wallet = wallet_address[network]

  const rate = TOKEN_RATE
  const hardCap = web3.toWei(HARD_CAP) // eth
  const distribution = DISTRIBUTION

  const totalSupply = ((hardCap * 100) / distribution) * rate
  const communityTokens = hardCap * rate
  const foundationKarbon14Tokens = totalSupply - communityTokens

  await deployer.deploy(Karbon14Token, TOKEN_NAME, TOKEN_TICKER, TOKEN_DECIMALS)
  const karbon14Token = await Karbon14Token.deployed()
  await karbon14Token.mint(wallet, foundationKarbon14Tokens)
}
