const Karbon14Token = artifacts.require('Karbon14Token')
const Karbon14Crowdsale = artifacts.require('Karbon14Crowdsale')
const { ether, bigNumberToString } = require('./Helpers')
const { TOKEN_RATE, TOKEN_TICKER, TOKEN_NAME } = require('../config.json')

const getContracts = async() => {
  const karbon14Token = await Karbon14Token.deployed()
  const karbon14Crowdsale = await Karbon14Crowdsale.deployed()
  return { karbon14Token,  karbon14Crowdsale }
}

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
