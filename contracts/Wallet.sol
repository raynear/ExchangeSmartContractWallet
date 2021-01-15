// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.6.0 <0.8.0;

import './IERC20.sol';
import './IWalletFactory.sol';

contract Wallet {
    address private _factoryAddress;

    constructor(address factory) public {
        _factoryAddress = factory;
    }

    function transfer(address ERC20) public {
        IERC20(ERC20).transfer(IWalletFactory(_factoryAddress).getColdWallet(ERC20), IERC20(ERC20).balanceOf(address(this)));
    }

    receive() external payable {
        IWalletFactory(_factoryAddress).getColdWallet(address(0)).transfer(msg.value);
    }
}