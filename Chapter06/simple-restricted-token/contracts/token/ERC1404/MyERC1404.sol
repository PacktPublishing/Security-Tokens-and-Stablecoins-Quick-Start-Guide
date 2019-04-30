/**
 * Blockchain Security Token Offerings Quick Start Guide
 * packt pub
 * @author Brian Wu
 */
pragma solidity ^0.4.24;
import "./ERC1404.sol";
import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/access/Whitelist.sol";
/// @title ERC-1404 implementation with built-in message and code management solution
/// @dev Inherit from this contract to implement your own ERC-1404 token
contract MyERC1404 is ERC1404, StandardToken, Whitelist {
    TokenInfo public tokenInfo;
    uint8 public constant SUCCESS_CODE = 0;
    string public constant SUCCESS_MESSAGE = "SUCCESS";
    uint8 public constant NON_WHITELIST_CODE = 2;
    string public constant NON_WHITELIST_ERROR = "ILLEGAL_TRANSFER_TO_NON_WHITELISTED_ADDRESS";
    struct TokenInfo {
        address initialAccount; 
        string name;
        string symbol;
        uint totalSupply;
    }
    constructor(string _name, string _symbol,  address initialAccount, uint256 initialBalance) public{
        balances[initialAccount] = initialBalance;
        totalSupply_ = initialBalance;
        addAddressToWhitelist(initialAccount);
        tokenInfo = TokenInfo(initialAccount, _name, _symbol,initialBalance);
    }
    modifier notRestricted (address from, address to, uint256 value) {
        uint8 restrictionCode = detectTransferRestriction(from, to, value);
        require(restrictionCode == SUCCESS_CODE, messageForTransferRestriction(restrictionCode));
        _;
    }
    function detectTransferRestriction (address from, address to, uint256 value)
        public
        view
        returns (uint8 restrictionCode)
    {
        if (!whitelist(to)) {
            restrictionCode = NON_WHITELIST_CODE; // illegal transfer outside of whitelist
        } else {
            restrictionCode = SUCCESS_CODE; // successful transfer (required)
        }
    }

        
    function messageForTransferRestriction (uint8 restrictionCode)
        public
        view
        returns (string message)
    {
        if (restrictionCode == SUCCESS_CODE) {
            message = SUCCESS_MESSAGE;
        } else if(restrictionCode == NON_WHITELIST_CODE) {
            message = NON_WHITELIST_ERROR;
        }
    }
    
    function transfer (address to, uint256 value)
        public
        notRestricted(msg.sender, to, value)
        returns (bool success)
    {
        success = super.transfer(to, value);
    }

    function transferFrom (address from, address to, uint256 value)
        notRestricted(from, to, value)
        returns (bool success)
    {
        success = super.transferFrom(from, to, value);
    }
}
