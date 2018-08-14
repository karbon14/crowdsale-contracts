const Karbon14Token = artifacts.require('karbon14Token')

contract('karbon14Token', function(accounts) {
  const _name = 'Karbon14 Token'
  const _symbol = 'K14'
  const _decimals = 8

  it(`should be ${_name} the name of the new token`, async() => {
    const karbon14Token = await Karbon14Token.deployed()
    const name = await karbon14Token.name()

    assert.equal(name, _name)
  })

  it(`should be ${_symbol} the symbol of the new token`, async() => {
    const karbon14Token = await Karbon14Token.deployed()
    const symbol = await karbon14Token.symbol()

    assert.equal(symbol, _symbol)
  })

  it(`should be ${_decimals} the decimals of the new token`, async() => {
    const karbon14Token = await Karbon14Token.deployed()
    const decimals = await karbon14Token.decimals()
    assert.equal(decimals, _decimals)
  })
})