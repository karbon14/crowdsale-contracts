const pify = require('pify');

const ethAsync = pify(web3.eth)

async function increaseTimeTo (target) {
  const now = (await latestTime());

  if (target < now) throw Error(`Cannot increase current time(${now}) to a moment in the past(${target})`);
  const diff = target - now;
  return increaseTime(diff);
}

const duration = {
  seconds: function (val) { return val; },
  minutes: function (val) { return val * this.seconds(60); },
  hours: function (val) { return val * this.minutes(60); },
  days: function (val) { return val * this.hours(24); },
  weeks: function (val) { return val * this.days(7); },
  years: function (val) { return val * this.days(365); },
};

const increaseTime = (duration) => {
  const id = Date.now();

  return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [duration],
      id: id,
      }, err1 => {
      if (err1) return reject(err1)

      web3.currentProvider.sendAsync({
          jsonrpc: '2.0',
          method: 'evm_mine',
          id: id + 1,
      }, (err2, res) => {
          return err2 ? reject(err2) : resolve(res)
      })
      })
  });
}

const advanceBlock = () => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: '2.0',
      method: 'evm_mine',
      id: Date.now(),
    }, (err, res) => {
      return err ? reject(err) : resolve(res);
    });
  });
}



const ether = (n) => new web3.BigNumber(web3.toWei(n, 'ether'))
const bigNumberToString = (bigNumbe) => web3.fromWei(bigNumbe.toNumber(), "ether" )
const getBalance = ethAsync.getBalance

module.exports = { ether, bigNumberToString, getBalance, increaseTime, increaseTimeTo, duration, advanceBlock }
