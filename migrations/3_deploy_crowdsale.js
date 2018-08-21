const Karbon14Token = artifacts.require('Karbon14Token')
const Karbon14Crowdsale = artifacts.require('Karbon14Crowdsale')

const duration = {
  seconds: function(val) { return val },
  minutes: function(val) { return val * this.seconds(60) },
  hours: function(val) { return val * this.minutes(60) },
  days: function(val) { return val * this.hours(24) },
  weeks: function(val) { return val * this.days(7) },
  years: function(val) { return val * this.days(365) },
}

const getConfig = (network) => network === 'live' ? require('../config.json') : require('../config-test.json')

module.exports = async (deployer, network, accounts, data) => {
  const { TOKEN_RATE, HARD_CAP, SOFT_CAP, DISTRIBUTION, OPENING_TIME_IN_DAYS, CLOSING_TIME_IN_DAYS } = getConfig(network) 

  const rate = TOKEN_RATE
  const wallet = accounts[2]
  const timeNow = Math.floor(Date.now() / 1000) 
  const openingTime = timeNow + duration.days(OPENING_TIME_IN_DAYS)
  const closingTime = timeNow + duration.days(CLOSING_TIME_IN_DAYS)
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
