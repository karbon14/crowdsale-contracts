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

module.exports = async (deployer, network, accounts, data) => {
  const rate = 1000; //1 eth = 1000 K14 tokens
  const wallet = accounts[0]
  const timeNow = Math.floor(Date.now() / 1000) 
  const openingTime = timeNow + duration.seconds(0)
  const closingTime = timeNow + duration.years(1)
  const cap = web3.toWei(100); //100 eth
  await deployer.deploy(Karbon14Crowdsale, rate, wallet, Karbon14Token.address, openingTime, closingTime, cap)
  
  const karbon14Crowdsale = await Karbon14Crowdsale.deployed()
  const karbon14Token = await Karbon14Token.deployed()
  await karbon14Token.transferOwnership(karbon14Crowdsale.address)
}