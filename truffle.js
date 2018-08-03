const HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: () => new HDWalletProvider(ROPSTEN_MNEMONIC, "https://ropsten.infura.io/8wEJLs1EO2BoAewPXTCL"),
      gas: 4698712,
      network_id: '3',
    },
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};