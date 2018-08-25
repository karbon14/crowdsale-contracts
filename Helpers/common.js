const isUnixTimestamp = x => {
  let timestamp = x * 1000
  let time = new Date(timestamp)

  return !isNaN(Date.parse(time))
}

module.exports = {
  isUnixTimestamp,
}
