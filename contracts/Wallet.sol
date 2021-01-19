// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.6.0 <0.8.0;

import './IERC20.sol';
import './IWalletFactory.sol';

contract Wallet {
    address private _master;

    constructor() public {
        _master = msg.sender;
    }

    function init(address master) external {
        require(_master == address(0));
        _master = master;
    }

    function transfer(address ERC20) public {
        IERC20(ERC20).transfer(IWalletFactory(_master).getColdWallet(ERC20), IERC20(ERC20).balanceOf(address(this)));
    }

    receive() external payable {
        IWalletFactory(_master).getColdWallet(address(0)).transfer(msg.value);
    }
}