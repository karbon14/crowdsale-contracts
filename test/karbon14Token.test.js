const Karbon14Token = artifacts.require('karbon14Token')
const { TOKEN_NAME, TOKEN_TICKER, TOKEN_DECIMALS } = require('../config.json')

contract('karbon14Token', function() {
  it(`should be ${TOKEN_NAME} the name of the new token`, async () => {
    const karbon14Token = await Karbon14Token.deployed()
    const name = await karbon14Token.name()

    assert.equal(name, TOKEN_NAME)
  })

  it(`should be ${TOKEN_TICKER} the symbol of the new token`, async () => {
    const karbon14Token = await Karbon14Token.deployed()
    const ticker = await karbon14Token.symbol()

    assert.equal(ticker, TOKEN_TICKER)
  })

  it(`should be ${TOKEN_DECIMALS} the decimals of the new token`, async () => {
    const karbon14Token = await Karbon14Token.deployed()
    const decimals = await karbon14Token.decimals()
    assert.equal(decimals, TOKEN_DECIMALS)
  })
})
