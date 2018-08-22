pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/distribution/RefundableCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";

interface MintableERC20 {
    function finishMinting() external returns (bool);
}

contract Karbon14Crowdsale is CappedCrowdsale, RefundableCrowdsale, MintedCrowdsale {
    using SafeMath for uint256;
    using SafeMath for uint;
    bool public isFinalized = false;
    MintableToken public token;
    uint hardCap;
    uint256 rate;
    uint distribution;

    event Finalized();

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

    function finalize() onlyOwner public {
        require(!isFinalized);
        require(hasClosed() || capReached());

        crowdsaleClose();
        emit Finalized();

        isFinalized = true;
    }

    function crowdsaleClose() internal {
        uint256 totalCommunityTokens = getMaxCommunityTokens();
        uint256 totalSupply = token.totalSupply();
        uint256 unsold = totalCommunityTokens.sub(totalSupply);
        uint256 totalFundationTokens = getTotalFundationTokens();

        // emit tokens for the foundation
        token.mint(wallet, totalFundationTokens.add(unsold));

        MintableERC20 mintableToken = MintableERC20(token);
        mintableToken.finishMinting();
        finalization();
    }
}
