const ether = (n) => new web3.BigNumber(web3.toWei(n, 'ether'))
const bigNumberToString = (bigNumbe) => web3.fromWei(bigNumbe.toNumber(), "ether" )
// const bigNumberToString = (bigNumbe)  => bigNumbe.toString() / Math.pow(10, 8)

module.exports = { ether, bigNumberToString }
