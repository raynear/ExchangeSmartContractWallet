// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.6.0 <0.8.0;

import './Wallet.sol';

contract NewWallet is Wallet {
    function test() public pure returns(string memory) {
        return "test";
    }
}