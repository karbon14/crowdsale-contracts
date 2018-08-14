const Karbon14Token = artifacts.require('Karbon14Token')

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(Karbon14Token, 'Karbon14 Token', 'K14', 8)
}