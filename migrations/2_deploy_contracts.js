const karbon14Token = artifacts.require('karbon14Token.sol')

module.exports = deployer => {
    deployer.deploy(karbon14Token)
}