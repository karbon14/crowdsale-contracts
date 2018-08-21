const Karbon14Token = artifacts.require('Karbon14Token')
const Karbon14Crowdsale = artifacts.require('Karbon14Crowdsale')
const { duration, increaseTimeTo } = require('../Helpers/increaseTime')
const { advanceBlock } = require('../Helpers/advanceToBlock')

const { ether, bigNumberToString, getBalance } = require('../Helpers/web3')
const { TOKEN_RATE, TOKEN_TICKER, TOKEN_NAME, OPENING_TIME_IN_DAYS, CLOSING_TIME_IN_DAYS, SOFT_CAP, HARD_CAP } = require('../config-test.json')

const getContracts = async() => {
  const karbon14Token = await Karbon14Token.deployed()
  const karbon14Crowdsale = await Karbon14Crowdsale.deployed()
  return { karbon14Token,  karbon14Crowdsale }
}

const timeAfterClosing = (opening, closing) => {
  const closingTime = duration.days(opening) + duration.days(closing)
  const timeNow = Math.floor(Date.now() / 1000) 
  return timeNow + closingTime + duration.seconds(1)
}

const closeCrowsale = () => increaseTimeTo(timeAfterClosing(OPENING_TIME_IN_DAYS, CLOSING_TIME_IN_DAYS))

const errorVM = 'VM Exception while processing transaction: revert'

const softCap = ether(SOFT_CAP)
const minSoftCap = ether(SOFT_CAP - 0.1)
const hardCap = ether(HARD_CAP)

contract('karbon14Crowdsale', function([owner, investor, wallet, purchaser]) {
  const value = ether(1);

  it(`should buy ${TOKEN_RATE} tokens ${TOKEN_TICKER} with 1ETH`, async () => {
    const { karbon14Crowdsale, karbon14Token } = await getContracts()

    await karbon14Crowdsale.buyTokens(investor, { value: value, from: purchaser })
    const tokens = await karbon14Token.balanceOf(investor)

    const actual = bigNumberToString(tokens)
    const expected = TOKEN_RATE

    assert.equal(actual, expected)
  })

  it('should the address token equals to address token in the crowdsale', async () => {
    const { karbon14Token, karbon14Crowdsale } = await getContracts()
    const actual = await karbon14Token.address
    const expected = await karbon14Crowdsale.token()

    assert.equal(actual, expected)
  })

  it(`should be the owner of the token ${TOKEN_NAME} the contract of ${TOKEN_NAME} Crowdsale`, async () => {
    const { karbon14Token, karbon14Crowdsale } = await getContracts()
    const actual = await karbon14Token.owner()
    const expected = karbon14Crowdsale.address

    assert.equal(actual, expected)
  })
})


contract('karbon14Crowdsale', function([owner, investor, wallet, purchaser]) {
  context('When call finalize and SOFT_CAP is not reached but is open the crowdsale', () => {
    it('should throw error', async () => {
      const { karbon14Crowdsale } = await getContracts()
      await karbon14Crowdsale.buyTokens(investor, { value: minSoftCap, from: investor })
      
      const actual = await karbon14Crowdsale.finalize().catch(e => e.message)
      const expected = errorVM

      assert(actual, expected)
    })
  })
})

contract('karbon14Crowdsale', function([owner, investor, wallet, purchaser]) {
  context('When call finalize and SOFT_CAP is reached but is open the crowdsale', () => {
    it('should throw error', async () => {
      const { karbon14Crowdsale } = await getContracts()
      await karbon14Crowdsale.buyTokens(investor, { value: softCap, from: investor })

      const actual = await karbon14Crowdsale.finalize().catch(e => e.message)
      const expected = errorVM

      assert(actual, expected)
    })
  })
})

contract('karbon14Crowdsale', function([owner, investor, wallet, purchaser]) {
  context('When call finalize and SOFT_CAP is reached but is close the crowdsale', () => {
    it('should get the event Finalized', async () => {
      const { karbon14Crowdsale } = await getContracts()
      await karbon14Crowdsale.buyTokens(investor, { value: softCap, from: investor })

      await closeCrowsale()

      const { logs } = await karbon14Crowdsale.finalize()
      const log = logs.find(e => e.event === 'Finalized')

      const actual = log.event
      const expected = 'Finalized'

      assert(actual, expected)
    })
  })
})

contract('karbon14Crowdsale', function([owner, investor, wallet, purchaser]) {
  context('When call finalize and HARD_CAP is reached but is open the crowdsale', () => {
    it('should get the event Finalized', async () => {
      const { karbon14Crowdsale } = await getContracts()
      await karbon14Crowdsale.buyTokens(investor, { value: hardCap, from: investor })

      const { logs } = await karbon14Crowdsale.finalize()
      const log = logs.find(e => e.event === 'Finalized')

      const actual = log.event
      const expected = 'Finalized'

      assert(actual, expected)
    })
  })
})

contract('karbon14Crowdsale', function([owner, investor, wallet, purchaser]) {
  context('When call finalize and HARD_CAP is reached but is close the crowdsale', () => {
    it('should get the event Finalized', async () => {
      const { karbon14Crowdsale } = await getContracts()
      await karbon14Crowdsale.buyTokens(investor, { value: hardCap, from: investor })

      await closeCrowsale()

      const { logs } = await karbon14Crowdsale.finalize()
      const log = logs.find(e => e.event === 'Finalized')

      const actual = log.event
      const expected = 'Finalized'

      assert(actual, expected)
    })
  })
})

contract('karbon14Crowdsale', function([owner, investor, wallet, purchaser]) {
  it(`should buy ${TOKEN_RATE} tokens ${TOKEN_TICKER} with 1ETH`, async () => {

    const balanceWallet = await getBalance(wallet)
    console.log("balanceWallet ",bigNumberToString(balanceWallet))

    const balanceOwner = await getBalance(owner)
    console.log("balanceOwner ",bigNumberToString(balanceOwner))

    const balanceInvestor = await getBalance(investor)
    console.log("balanceInvestor ",bigNumberToString(balanceInvestor))


    const balancePurchaser = await getBalance(purchaser)
    console.log("balancePurchaser ",bigNumberToString(balancePurchaser))
    console.log("====================================================================")
    const { karbon14Crowdsale, karbon14Token } = await getContracts()

    // await karbon14Crowdsale.sendTransaction({ value, from: investor });
    await karbon14Crowdsale.sendTransaction({ value: ether(1), from: investor, gasPrice: 0 })
    const bkarbon14Crowdsale = await getBalance(karbon14Crowdsale.address)
    console.log("bkarbon14Crowdsale ",bigNumberToString(bkarbon14Crowdsale))
    await increaseTimeTo(timeAfterClosing(OPENING_TIME_IN_DAYS, CLOSING_TIME_IN_DAYS))
    await karbon14Crowdsale.finalize({ from: owner })

    const balanceWalletAfter = await getBalance(wallet)
    console.log("balanceWalletAfter ",bigNumberToString(balanceWalletAfter))

    const balanceOwnerAfter = await getBalance(owner)
    console.log("balanceOwnerAfter ",bigNumberToString(balanceOwnerAfter))

    const balanceInvestorAfter = await getBalance(investor)
    console.log("balanceInvestorAfter ",bigNumberToString(balanceInvestorAfter))


    const balancePurchaserAfter = await getBalance(purchaser)
    console.log("balancePurchaserAfter ",bigNumberToString(balancePurchaserAfter))

   


    
  })
})
