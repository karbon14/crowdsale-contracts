pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol";

contract Karbon14Token is DetailedERC20, MintableToken, BurnableToken, PausableToken {
    constructor(string _name, string _symbol, uint8 _decimals) 
        DetailedERC20(_name, _symbol, _decimals)
        public
    {

    }

}
