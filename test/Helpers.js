const ether = (n) => new web3.BigNumber(web3.toWei(n, 'ether'))

module.exports = { ether }