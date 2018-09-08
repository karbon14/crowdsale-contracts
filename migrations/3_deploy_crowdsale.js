const Karbon14Token = artifacts.require('Karbon14Token')
const Karbon14Crowdsale = artifacts.require('Karbon14Crowdsale')
const { getConfig } = require('../Helpers/getConfig')

const duration = {
  seconds: function(val) {
    return val
  },
  minutes: function(val) {
    return val * this.seconds(60)
  },
  hours: function(val) {
    return val * this.minutes(60)
  },
  days: function(val) {
    return val * this.hours(24)
  },
  weeks: function(val) {
    return val * this.days(7)
  },
  years: function(val) {
    return val * this.days(365)
  },
}

module.exports = async (deployer, network, accounts) => {
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

  const wallet_address = {
    development: accounts[2],
    ropsten: accounts[0],
    live: WALLET_ADDRESS,
  }

  const rate = TOKEN_RATE
  const wallet = wallet_address[network]
  const timeNow = Math.floor(Date.now() / 1000)
  const openingTime = timeNow + duration.days(OPENING_TIME_IN_DAYS) + duration.hours(TIMEZONE)
  const closingTime = timeNow + duration.days(CLOSING_TIME_IN_DAYS) + duration.hours(TIMEZONE)
  const hardCap = web3.toWei(HARD_CAP) // eth
  const softCap = web3.toWei(SOFT_CAP) // eth
  const distribution = DISTRIBUTION

  await deployer.deploy(
    Karbon14Crowdsale,
    rate,
    wallet,
    Karbon14Token.address,
    openingTime,
    closingTime,
    hardCap,
    softCap,
    distribution
  )

  const karbon14Crowdsale = await Karbon14Crowdsale.deployed()
  const karbon14Token = await Karbon14Token.deployed()
  await karbon14Token.transferOwnership(karbon14Crowdsale.address)
}
