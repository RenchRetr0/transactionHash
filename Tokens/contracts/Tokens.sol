// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "./ERC20.sol";

contract Tokens is ERC20 {

    address public owner;

    // mapping (address => uint256) private _balances;

    // event Transferr(address indexed _from, address indexed _to, uint _value);

    constructor(string memory name_, string memory symbol_, uint values, address _owner) ERC20(name_, symbol_) {
        owner = _owner;
        _mint(owner, values);
    }
    
    function Mint(address account, uint256 amount) public {
        _mint(account, amount);
    }

    function GetOwner() public view virtual returns (address) {
        return owner;
    }
}