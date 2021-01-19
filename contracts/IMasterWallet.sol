// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

interface IMasterWallet {
    function getColdWallet(address tokenAddress) external view returns(address payable);
}