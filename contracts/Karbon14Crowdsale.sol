pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "./helpers/RefundableCrowdsale.sol";

contract Karbon14Crowdsale is RefundableCrowdsale, MintedCrowdsale {
    using SafeMath for uint256;
    using SafeMath for uint;
    MintableToken public token;
    uint hardCap;
    uint256 rate;
    uint distribution;

    event WalletChange(address wallet);

    constructor
    (
        uint256 _rate,
        address _wallet,
        MintableToken _token,
        uint256 _openingTime,
        uint256 _closingTime,
        uint _hardCap,
        uint _softCap, 
        uint _distribution
    ) 
        Crowdsale(_rate, _wallet, _token)
        TimedCrowdsale(_openingTime, _closingTime)
        CappedCrowdsale(_hardCap)
        RefundableCrowdsale(_softCap)
        public
    {
        token = _token;
        hardCap = _hardCap;
        rate = _rate;
        distribution = _distribution;
    }

    function changeWallet(address _wallet) public onlyOwner {
        require(_wallet != 0x0, "Wallet is required.");
        wallet = _wallet;
        emit WalletChange(_wallet);
    }

    function getTotalSupply() public view returns(uint256) {
        uint256 totalSupply = token.totalSupply();
        return totalSupply;
    }

    function getMaxCommunityTokens() public view returns(uint256) {
        uint256 tokenComminity = hardCap.mul(rate);
        return tokenComminity;
    }

    function getTotalFundationTokens() public view returns(uint256) {
        return getTokenTotalSupply() - getMaxCommunityTokens();
    }

    function getTokenTotalSupply() public view returns(uint256) {
        return hardCap.mul(100).div(distribution).mul(rate);
    }

    function crowdsaleClose() internal {
        uint256 totalCommunityTokens = getMaxCommunityTokens();
        uint256 buyCommunity = token.totalSupply().sub(getTotalFundationTokens());
        uint256 unsold = totalCommunityTokens.sub(buyCommunity);

        // emit tokens for the foundation
        if (goalReached()) {
            token.mint(wallet, unsold);
        } else {
            token.mint(wallet, totalCommunityTokens);
        }

        token.transferOwnership(wallet);
    }
}
