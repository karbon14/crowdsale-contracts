const { getBlock } = require('./web3');

// Returns the time of the last mined block in seconds
const latestTime = async () => {
  const block = await getBlock('latest');
  return block.timestamp;
}

module.exports = {
  latestTime,
};
