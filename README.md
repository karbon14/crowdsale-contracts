# Karbon14 Crowdsale Contracts

[![Build Status](https://travis-ci.org/karbon14/crowdsale-contracts.svg?branch=master)](https://travis-ci.org/karbon14/crowdsale-contracts)


## Mainnet addresses:

- Cowdsale: https://etherscan.io/address/0x8973db8731b364985ffa4d6f579e0d1a022ad6e6
- Karbon14 Token (K14): https://etherscan.io/address/0x2fb2401b7498f5467b20cebfba11acdf4fa2fdad

## Details about Karbon14 token

The token Karbon14 extend the these contracts DetailedERC20, MintableToken, BurnableToken and PausableToken.

- **DetailedERC20 (Extends of ERC20):** An ERC20 token is a contract that keeps track of a mapping(address => uint256) that represents a user's balance. These tokens are fungible in that any one token is exactly equal to any other token; no tokens have special rights or behavior associated with them. This makes ERC20 useful for things like a medium of exchange currency, general voting rights, staking, and more.

This behavior adds extra security to the community:

- **MintableToken:** Allows users with the MinterRole to call the mint() function and mint tokens to users. Minting can also be finished, locking the mint() function's behavior. In karbon14 only the owner can execute this action or in the stage of crowdsale where the owner is the contract of the crowsale.

- **BurnableToken:** If your token can be burned (aka, it can be destroyed), include this one. In karbon14 only the owner can execute this action.

- **PausableToken:** Allows anyone with the Pauser role to pause the token, freezing transfers to and from users. This is useful if you want to stop trades until the end of a crowdsale, or if you want to have an emergency switch for freezing your tokens in the event of a large bug. Note that there are inherent decentralization tradeoffs when using a pausable token; users may not expect that their unstoppable money can be frozen by a single address!. In karbon14 only the owner can execute this action.

## Details about Crowdsale of Karbon14

The contract of the Crowdasle of Karbon14 extends of RefundableCrowdsale and MintedCrowdsale.

- **MintedCrowdsale:** The Crowdsale mints tokens when a purchase is made.

- **RefundableCrowdsale:** Offers to refund users if a minimum goal is not reached. If the goal is not reached, the users can claimRefund() to get their Ether back. RefundableCrowdsale brings another function like as TimedCrowdsale and CappedCrowdsale.

- **TimedCrowdsale:** Adds an openingTime and closingTime to your crowdsale.

- **CappedCrowdsale:** Adds a cap to your crowdsale, invalidating any purchases that would exceed that cap.

## Generating the final tokens when finalizing the crowsale

You can check the function `crowdsaleClose` in the contract `Karbon14Crowdsale`. When the `finalize` method will be executed, the total of the tokens will be launch.
 
## Development:

We used Truffle and Open Zeppelin contracts to build our crowdsale and the ERC-20 Token.

## Testing:

We have 1700+ lines of tests. There are two test files:

- One tests the wallet
- The other one tests the crowdsale token contracts


### Run the test

```
npm i
npm run ganache
npm run test
```






## Team

[![Natanael Zalazar](https://avatars.githubusercontent.com/u/11928153?s=64)](https://github.com/zalazarnatanael)  |
[![Vision K14](https://avatars3.githubusercontent.com/u/41881618?s=64)](https://github.com/visionk14) |
[![Wolverine K14](https://avatars3.githubusercontent.com/u/41843272?s=64)](https://github.com/wolverinek14) |
|---|---|---|
Natanael Zalazar | Vision K14 | Wolverine K14 |
:octocat:[@zalazarnatanael](https://github.com/zalazarnatanael) | :octocat:[@visionk14](https://github.com/visionk14) | :octocat:[@wolverinek14](https://github.com/wolverinek14) |


## License
[MIT](https://github.com/karbon14/crowdsale-contracts/blob/master/.github/LICENSE)
