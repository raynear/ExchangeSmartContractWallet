// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.6.0 <0.8.0;

import './IMasterWallet.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/Initializable.sol';

contract Wallet is Initializable {
    address private _master;

    function initialize(address master) public initializer {
        _master = master;
    }

    function transfer(address ERC20) public {
        IERC20(ERC20).transfer(IMasterWallet(_master).getColdWallet(ERC20), IERC20(ERC20).balanceOf(address(this)));
    }

    receive() external payable {
        IMasterWallet(_master).getColdWallet(address(0)).transfer(msg.value);
    }
}