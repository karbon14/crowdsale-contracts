const pify = require('pify')

const ethAsync = pify(web3.eth)

const ether = n => new web3.BigNumber(web3.toWei(n, 'ether'))
const bigNumberToString = bigNumber => web3.fromWei(bigNumber.toNumber(), 'ether')
const { getBalance, sendTransaction, getBlock } = ethAsync

module.exports = {
  getBalance,
  sendTransaction,
  getBlock,
  ether,
  bigNumberToString,
}
