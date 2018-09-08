const Migrations = artifacts.require('Migrations')
const { getConfig } = require('../Helpers/getConfig')

module.exports = async function(deployer, network) {
  const {
    TOKEN_RATE,
    HARD_CAP,
    SOFT_CAP,
    DISTRIBUTION,
    OPENING_TIME_IN_DAYS,
    CLOSING_TIME_IN_DAYS,
    WALLET_ADDRESS,
    TIMEZONE,
  } = getConfig(network)

  /* eslint-disable no-console */
  console.log('network', network)
  console.log('TOKEN_RATE: ', TOKEN_RATE)
  console.log('HARD_CAP: ', HARD_CAP)
  console.log('SOFT_CAP: ', SOFT_CAP)
  console.log('DISTRIBUTION: ', DISTRIBUTION)
  console.log('OPENING_TIME_IN_DAYS: ', OPENING_TIME_IN_DAYS)
  console.log('CLOSING_TIME_IN_DAYS: ', CLOSING_TIME_IN_DAYS)
  console.log('WALLET_ADDRESS: ', WALLET_ADDRESS)
  console.log('TIMEZONE: ', TIMEZONE)
  /* eslint-enable no-console */
  await deployer.deploy(Migrations)
}
