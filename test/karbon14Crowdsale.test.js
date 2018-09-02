const Karbon14Token = artifacts.require('Karbon14Token')
const Karbon14Crowdsale = artifacts.require('Karbon14Crowdsale')
const { duration, increaseTimeTo } = require('../Helpers/increaseTime')
const { latestTime } = require('../Helpers/latestTime')
const { isUnixTimestamp } = require('../Helpers/common')
const { ether, bigNumberToString, getBalance } = require('../Helpers/web3')
const {
  TOKEN_RATE,
  TOKEN_TICKER,
  TOKEN_NAME,
  OPENING_TIME_IN_DAYS,
  CLOSING_TIME_IN_DAYS,
  SOFT_CAP,
  HARD_CAP,
} = require('../config-test.json')

const getContracts = async () => {
  const karbon14Token = await Karbon14Token.deployed()
  const karbon14Crowdsale = await Karbon14Crowdsale.deployed()
  return { karbon14Token, karbon14Crowdsale }
}

const timeAfterClosing = (opening, closing) => {
  const closingTime = duration.days(opening) + duration.days(closing)
  const timeNow = Math.floor(Date.now() / 1000)
  return timeNow + closingTime + duration.seconds(1)
}

const timeOppening = async days => {
  const time = await latestTime()
  return time + duration.days(days)
}

const closeCrowsale = () => increaseTimeTo(timeAfterClosing(OPENING_TIME_IN_DAYS, CLOSING_TIME_IN_DAYS))
const openCrowsale = async () => increaseTimeTo(await timeOppening(OPENING_TIME_IN_DAYS))

const errorVM = 'VM Exception while processing transaction: revert'

const softCap = ether(SOFT_CAP)
const minSoftCap = ether(SOFT_CAP - 0.1)
const hardCap = ether(HARD_CAP)

describe('karbon14Crowdsale', () => {
  contract('karbon14Crowdsale', async ([owner, investor, wallet, purchaser]) => {
    it('should log purchase', async function() {
      const { karbon14Crowdsale } = await getContracts()
      const value = ether(1)
      await openCrowsale()
      const { logs } = await karbon14Crowdsale.sendTransaction({ value, from: investor })
      const event = logs.find(e => e.event === 'TokenPurchase')

      const actual = {
        event: event.event,
        value: bigNumberToString(event.args.value),
        purchaser: event.args.purchaser,
        beneficiary: event.args.beneficiary,
        amount: bigNumberToString(value) * TOKEN_RATE,
      }

      const expected = {
        event: 'TokenPurchase',
        value: bigNumberToString(value),
        purchaser: investor,
        beneficiary: investor,
        amount: bigNumberToString(value) * TOKEN_RATE,
      }

      assert.deepEqual(actual, expected)
    })

    it('should return valid UNIX timestamp in openingTime', async function() {
      const { karbon14Crowdsale } = await getContracts()
      const openingTime = await karbon14Crowdsale.openingTime()

      const actual = isUnixTimestamp(openingTime.c[0])
      const expected = true

      assert.deepEqual(actual, expected)
    })

    it('should return valid UNIX timestamp in closingTime', async function() {
      const { karbon14Crowdsale } = await getContracts()
      const openingTime = await karbon14Crowdsale.closingTime()

      const actual = isUnixTimestamp(openingTime.c[0])
      const expected = true

      assert.deepEqual(actual, expected)
    })

    it('should return the soft cap', async function() {
      const { karbon14Crowdsale } = await getContracts()
      const goal = await karbon14Crowdsale.goal()

      const actual = bigNumberToString(goal)
      const expected = bigNumberToString(softCap)

      assert.deepEqual(actual, expected)
    })

    it('should return the hard cap', async function() {
      const { karbon14Crowdsale } = await getContracts()
      await openCrowsale()

      const cap = await karbon14Crowdsale.cap()

      const actual = bigNumberToString(cap)
      const expected = bigNumberToString(hardCap)

      assert.deepEqual(actual, expected)
    })

    it('should return wallet', async function() {
      const { karbon14Crowdsale } = await getContracts()
      await openCrowsale()

      const actual = await karbon14Crowdsale.wallet()
      const expected = wallet

      assert.deepEqual(actual, expected)
    })
  })

  contract('karbon14Crowdsale', async ([owner, investor, wallet, purchaser]) => {
    it('should return total found during the crowdsale', async function() {
      const { karbon14Crowdsale } = await getContracts()
      const value = ether(1)
      await openCrowsale()

      const foundInEth1 = await karbon14Crowdsale.weiRaised()
      assert.deepEqual(bigNumberToString(foundInEth1), '0')

      await karbon14Crowdsale.sendTransaction({ value, from: investor })
      const foundInEth2 = await karbon14Crowdsale.weiRaised()

      assert.deepEqual(bigNumberToString(foundInEth2), '1')

      await karbon14Crowdsale.sendTransaction({ value, from: investor })
      const foundInEth3 = await karbon14Crowdsale.weiRaised()

      assert.deepEqual(bigNumberToString(foundInEth3), '2')
    })
  })
})

describe('karbon14Crowdsale MintableToken', () => {
  contract('karbon14Crowdsale', async ([owner, investor, wallet, purchaser]) => {
    it(`should buy ${TOKEN_RATE} tokens ${TOKEN_TICKER} with 1ETH`, async () => {
      const { karbon14Crowdsale, karbon14Token } = await getContracts()
      const value = ether(1)
      await openCrowsale()

      await karbon14Crowdsale.buyTokens(investor, { value: value, from: purchaser })
      const tokens = await karbon14Token.balanceOf(investor)

      const actual = bigNumberToString(tokens)
      const expected = TOKEN_RATE.toString()

      assert.deepEqual(actual, expected)
    })

    it('should the address token equals to address token in the crowdsale', async () => {
      const { karbon14Token, karbon14Crowdsale } = await getContracts()
      const actual = await karbon14Token.address
      const expected = await karbon14Crowdsale.token()

      assert.deepEqual(actual, expected)
    })
  })

  contract('karbon14Crowdsale', async ([owner, investor, wallet, purchaser]) => {
    it(`should be the owner of the token ${TOKEN_NAME} the contract of ${TOKEN_NAME} Crowdsale`, async () => {
      const { karbon14Token, karbon14Crowdsale } = await getContracts()

      const actual = await karbon14Token.owner()
      const expected = karbon14Crowdsale.address

      assert.deepEqual(actual, expected)
    })
  })
})

describe('karbon14Crowdsale Capped', () => {
  context('accepting payments', () => {
    contract('karbon14Crowdsale', () => {
      it('should accept payments within cap', async () => {
        const { karbon14Crowdsale } = await getContracts()
        await openCrowsale()
        const cap = ether(HARD_CAP)
        const lessThanCap = ether(1)

        await karbon14Crowdsale.send(cap.minus(lessThanCap))
        await karbon14Crowdsale.send(lessThanCap)
      })
    })

    contract('karbon14Crowdsale', () => {
      it('should reject payments outside cap', async () => {
        const { karbon14Crowdsale } = await getContracts()
        await openCrowsale()
        const cap = ether(HARD_CAP)
        await karbon14Crowdsale.send(cap)

        const actual = await karbon14Crowdsale.send(1).catch(e => e.message)
        const expected = errorVM

        assert.deepEqual(actual, expected)
      })
    })

    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      it('should reject payments that exceed cap', async () => {
        const { karbon14Crowdsale } = await getContracts()
        await openCrowsale()
        const cap = ether(HARD_CAP)

        const actual = await karbon14Crowdsale.send(cap.plus(1)).catch(e => e.message)
        const expected = errorVM

        assert.deepEqual(actual, expected)
      })
    })
  })

  context('ending', () => {
    contract('karbon14Crowdsale', () => {
      it('should not reach cap if sent under cap', async () => {
        const { karbon14Crowdsale } = await getContracts()
        await openCrowsale()
        const lessThanCap = ether(1)
        await karbon14Crowdsale.send(lessThanCap)

        const actual = await karbon14Crowdsale.capReached()
        const expected = false

        assert.deepEqual(actual, expected)
      })
    })

    contract('karbon14Crowdsale', () => {
      it('should not reach cap if sent just under cap', async () => {
        const { karbon14Crowdsale } = await getContracts()
        await openCrowsale()
        const cap = ether(HARD_CAP)
        await karbon14Crowdsale.send(cap.minus(1))

        const actual = await karbon14Crowdsale.capReached()
        const expected = false

        assert.deepEqual(actual, expected)
      })
    })

    contract('karbon14Crowdsale', () => {
      it('should reach cap if cap sent', async () => {
        const { karbon14Crowdsale } = await getContracts()
        await openCrowsale()
        const cap = ether(HARD_CAP)
        await karbon14Crowdsale.send(cap)

        const actual = await karbon14Crowdsale.capReached()
        const expected = true

        assert.deepEqual(actual, expected)
      })
    })
  })
})

describe('karbon14Crowdsale Refundable', () => {
  contract('karbon14Crowdsale', ([owner, investor]) => {
    it('should deny refunds before end', async () => {
      const { karbon14Crowdsale } = await getContracts()
      await openCrowsale()

      await karbon14Crowdsale.buyTokens(investor, { value: ether(1), from: investor })

      const actual = await karbon14Crowdsale.claimRefund({ from: investor }).catch(e => e.message)
      const expected = errorVM

      assert.deepEqual(actual, expected)
    })
  })

  contract('karbon14Crowdsale', ([owner, investor]) => {
    it('should deny refunds after end if goal was reached', async () => {
      const { karbon14Crowdsale } = await getContracts()
      await openCrowsale()

      await karbon14Crowdsale.buyTokens(investor, { value: hardCap, from: investor })
      await closeCrowsale()
      await karbon14Crowdsale.finalize({ from: owner })

      const actual = await karbon14Crowdsale.claimRefund({ from: investor }).catch(e => e.message)
      const expected = errorVM

      assert.deepEqual(actual, expected)
    })
  })

  contract('karbon14Crowdsale', ([owner, investor, wallet]) => {
    it('should allow refunds after end if goal was not reached', async () => {
      const { karbon14Crowdsale } = await getContracts()
      await openCrowsale()

      const balanceInvestorBefore = await getBalance(investor)
      await karbon14Crowdsale.sendTransaction({ value: ether(1), from: investor, gasPrice: 0 })

      await closeCrowsale()

      await karbon14Crowdsale.finalize({ from: owner })
      await karbon14Crowdsale.claimRefund({ from: investor, gasPrice: 0 })
      const balanceInvestorAfter = await getBalance(investor)

      const actual = bigNumberToString(balanceInvestorBefore)
      const expected = bigNumberToString(balanceInvestorAfter)

      assert.deepEqual(actual, expected)
    })
  })

  contract('karbon14Crowdsale', ([owner, investor, wallet]) => {
    it('should forward funds to wallet after end if goal was reached', async () => {
      const { karbon14Crowdsale } = await getContracts()
      await openCrowsale()

      const balanceWalletBefore = await getBalance(wallet)
      await karbon14Crowdsale.sendTransaction({ value: softCap, from: investor, gasPrice: 0 })

      await closeCrowsale()

      await karbon14Crowdsale.finalize({ from: owner })
      const balanceWalletAfter = await getBalance(wallet)

      const actual = bigNumberToString(balanceWalletAfter.minus(balanceWalletBefore))
      const expected = bigNumberToString(softCap)

      assert.deepEqual(actual, expected)
    })
  })
})

describe('karbon14Crowdsale Finalize', () => {
  contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
    context('When call finalize and SOFT_CAP is not reached but is open the crowdsale', () => {
      it('should throw error', async () => {
        const { karbon14Crowdsale } = await getContracts()
        await openCrowsale()
        await karbon14Crowdsale.buyTokens(investor, { value: minSoftCap, from: investor })

        const actual = await karbon14Crowdsale.finalize().catch(e => e.message)
        const expected = errorVM

        assert.deepEqual(actual, expected)
      })
    })
  })

  contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
    context('When call finalize and SOFT_CAP is reached but is open the crowdsale', () => {
      it('should throw error', async () => {
        const { karbon14Crowdsale } = await getContracts()
        await openCrowsale()
        await karbon14Crowdsale.buyTokens(investor, { value: softCap, from: investor })

        const actual = await karbon14Crowdsale.finalize().catch(e => e.message)
        const expected = errorVM

        assert.deepEqual(actual, expected)
      })
    })
  })

  contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
    context('When call finalize and SOFT_CAP is reached but is close the crowdsale', () => {
      it('should get the event Finalized', async () => {
        const { karbon14Crowdsale } = await getContracts()
        await openCrowsale()
        await karbon14Crowdsale.buyTokens(investor, { value: softCap, from: investor })

        await closeCrowsale()

        const { logs } = await karbon14Crowdsale.finalize()
        const log = logs.find(e => e.event === 'Finalized')

        const actual = log.event
        const expected = 'Finalized'

        assert.deepEqual(actual, expected)
      })
    })
  })

  contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
    context('When call finalize and HARD_CAP is reached but is open the crowdsale', () => {
      it('should get the event Finalized', async () => {
        const { karbon14Crowdsale } = await getContracts()
        await openCrowsale()
        await karbon14Crowdsale.buyTokens(investor, { value: hardCap, from: investor })

        const { logs } = await karbon14Crowdsale.finalize()
        const log = logs.find(e => e.event === 'Finalized')

        const actual = log.event
        const expected = 'Finalized'

        assert.deepEqual(actual, expected)
      })
    })
  })

  contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
    context('When call finalize and HARD_CAP is reached but is close the crowdsale', () => {
      it('should get the event Finalized', async () => {
        const { karbon14Crowdsale } = await getContracts()
        await openCrowsale()
        await karbon14Crowdsale.buyTokens(investor, { value: hardCap, from: investor })

        await closeCrowsale()

        const { logs } = await karbon14Crowdsale.finalize()
        const log = logs.find(e => e.event === 'Finalized')

        const actual = log.event
        const expected = 'Finalized'

        assert.deepEqual(actual, expected)
      })
    })
  })

  contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
    context('When third party want to finalize after ending ', () => {
      it('should throw error', async () => {
        const { karbon14Crowdsale } = await getContracts()

        await openCrowsale()
        await closeCrowsale()

        const actual = await karbon14Crowdsale.finalize({ from: purchaser }).catch(e => e.message)
        const expected = errorVM

        assert.deepEqual(actual, expected)
      })
    })
  })

  contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
    context('When is called twice', () => {
      it('should throw error', async () => {
        const { karbon14Crowdsale } = await getContracts()

        await openCrowsale()
        await karbon14Crowdsale.buyTokens(investor, { value: hardCap, from: investor })
        await closeCrowsale()
        await karbon14Crowdsale.finalize({ from: owner })

        const actual = await karbon14Crowdsale.finalize({ from: owner }).catch(e => e.message)
        const expected = errorVM

        assert.deepEqual(actual, expected)
      })
    })
  })
})

describe('karbon14Crowdsale changeWallet', () => {
  contract('karbon14Crowdsale', ([owner, investor, wallet, newWallet]) => {
    it('should return the new wallet', async () => {
      const { karbon14Crowdsale } = await getContracts()
      await openCrowsale()

      await karbon14Crowdsale.changeWallet(newWallet)

      const actual = await karbon14Crowdsale.wallet()
      const expected = newWallet

      assert.deepEqual(actual, expected)
    })

    it('should return event WalletChange', async () => {
      const { karbon14Crowdsale } = await getContracts()
      await openCrowsale()

      const { logs } = await karbon14Crowdsale.changeWallet(newWallet)
      const { event } = logs.find(e => e.event === 'WalletChange')

      const actual = event
      const expected = 'WalletChange'

      assert.deepEqual(actual, expected)
    })

    it('should revert if is not owner', async () => {
      const { karbon14Crowdsale } = await getContracts()
      await openCrowsale()

      const actual = await karbon14Crowdsale.changeWallet(newWallet, { from: investor }).catch(e => e.message)
      const expected = errorVM

      assert.deepEqual(actual, expected)
    })

    it('should return an error when is an empty Wallet', async () => {
      const { karbon14Crowdsale } = await getContracts()
      await openCrowsale()

      const actual = await karbon14Crowdsale.changeWallet().catch(e => e.message)
      const expected = 'Invalid number of arguments to Solidity function'

      assert.deepEqual(actual, expected)
    })
  })
})

describe('karbon14Crowdsale Foundation Token', () => {
  contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
    context('When call finalize and SOFT_CAP is not reached and is closed the crowdsale', () => {
      it('should the balance in ETH of the wallet the same before of the crowdsale', async () => {
        const { karbon14Crowdsale } = await getContracts()
        const underSoftCap = ether(SOFT_CAP - 1)
        const actual = bigNumberToString(await getBalance(wallet))

        await openCrowsale()
        await karbon14Crowdsale.buyTokens(investor, { value: underSoftCap, from: investor })

        await closeCrowsale()
        await karbon14Crowdsale.finalize()

        const expected = bigNumberToString(await getBalance(wallet))

        assert.deepEqual(actual, expected)
      })
    })
  })

  contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
    context('When call finalize and SOFT_CAP is not reached and is closed the crowdsale', () => {
      it('should the balance in ETH of the wallet the same CAP', async () => {
        const { karbon14Crowdsale } = await getContracts()
        const balanceBefore = await getBalance(wallet)

        await openCrowsale()
        await karbon14Crowdsale.buyTokens(investor, { value: softCap, from: investor })

        await closeCrowsale()
        await karbon14Crowdsale.finalize()

        const actual = bigNumberToString(await getBalance(wallet))
        const expected = bigNumberToString(balanceBefore.plus(softCap))

        assert.deepEqual(actual, expected)
      })
    })
  })

  contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
    context('When call finalize and SOFT_CAP is not reached and is closed the crowdsale', () => {
      it('should the balance the total supply', async () => {
        const { karbon14Token, karbon14Crowdsale } = await getContracts()
        const underSoftCap = ether(SOFT_CAP - 1)

        await openCrowsale()
        await karbon14Crowdsale.buyTokens(investor, { value: underSoftCap, from: investor })

        await closeCrowsale()
        await karbon14Crowdsale.finalize()

        const actual = bigNumberToString(await karbon14Token.balanceOf(wallet))
        const expected = bigNumberToString(await karbon14Crowdsale.getTokenTotalSupply())

        assert.deepEqual(actual, expected)
      })
    })
  })

  contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
    context('When call finalize and SOFT_CAP is reached and is closed the crowdsale', () => {
      it('should the balance the tokens the total supply minus the soft cap', async () => {
        const { karbon14Token, karbon14Crowdsale } = await getContracts()

        await openCrowsale()
        await karbon14Crowdsale.buyTokens(investor, { value: softCap, from: investor })

        await closeCrowsale()
        await karbon14Crowdsale.finalize()

        const totalSupply = await karbon14Token.totalSupply()

        const actual = bigNumberToString(await karbon14Token.balanceOf(wallet))
        const expected = bigNumberToString(totalSupply.minus(softCap.mul(TOKEN_RATE)))

        assert.deepEqual(actual, expected)
      })
    })
  })

  contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
    context('When call finalize and HARD_CAP is not reached and is closed the crowdsale', () => {
      it('should the balance in ETH of the wallet the same CAP', async () => {
        const { karbon14Crowdsale } = await getContracts()
        const balanceBefore = await getBalance(wallet)

        await openCrowsale()
        await karbon14Crowdsale.buyTokens(investor, { value: hardCap, from: investor })

        await closeCrowsale()
        await karbon14Crowdsale.finalize()

        const actual = bigNumberToString(await getBalance(wallet))
        const expected = bigNumberToString(balanceBefore.plus(hardCap))

        assert.deepEqual(actual, expected)
      })
    })
  })

  contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
    context('When call finalize and HARD_CAP is reached and is closed the crowdsale', () => {
      it('should the balance the tokens the total supply minus the soft cap', async () => {
        const { karbon14Token, karbon14Crowdsale } = await getContracts()

        await openCrowsale()
        await karbon14Crowdsale.buyTokens(investor, { value: hardCap, from: investor })

        await closeCrowsale()
        await karbon14Crowdsale.finalize()

        const totalSupply = await karbon14Token.totalSupply()

        const actual = bigNumberToString(await karbon14Token.balanceOf(wallet))
        const expected = bigNumberToString(totalSupply.minus(hardCap.mul(TOKEN_RATE)))

        assert.deepEqual(actual, expected)
      })
    })
  })
})
