// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.6.0 <0.8.0;

import './IMasterWallet.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol';

contract Wallet {
    address private _master;

    function initialize(address master) public {
        require(_master == address(0));
        _master = master;
    }

    function transfer(address ERC20) public {
        if(ERC20 == address(0)) {
            payable(_master).call{value:address(this).balance}("");
        } else {
            SafeERC20.safeTransfer(IERC20(ERC20), _master, IERC20(ERC20).balanceOf(address(this)));
        }
    }

    receive() external payable {}
}