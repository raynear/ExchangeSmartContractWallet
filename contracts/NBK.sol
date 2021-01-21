// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol';

contract NBKToken is ERC20UpgradeSafe {
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply
    )
    public {
        __ERC20_init(_name, _symbol);
        _mint(msg.sender, _maxSupply*(10**18));
    }
}