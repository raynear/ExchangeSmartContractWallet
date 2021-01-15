// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;
pragma experimental ABIEncoderV2;

import './Ownable.sol';
import './Wallet.sol';
import './IERC20.sol';

contract WalletFactory is Ownable {
    mapping(address => address payable) public _coldWallet;

    event ColdWalletChanged(address tokenAddress, address coldWalletAddress);
    event WalletCreated(address walletAddress, address factoryAddress);

    struct withdraw {
        address tokenAddress;
        address payable to;
        uint256 amount;
    }

    function sendTokens(withdraw[] memory WithdrawList) public payable onlyManager {
        for(uint i=0 ; i<WithdrawList.length ; i++) {
            if(WithdrawList[i].tokenAddress == address(0)) {
                require(WithdrawList[i].amount <= address(this).balance);
                WithdrawList[i].to.transfer(WithdrawList[i].amount);
            } else {
                require(WithdrawList[i].amount <= IERC20(WithdrawList[i].tokenAddress).balanceOf(address(this)));
                IERC20(WithdrawList[i].tokenAddress).transfer(WithdrawList[i].to, WithdrawList[i].amount);
            }
        }
    }

    receive() external payable {}

    function setColdWallet(address tokenAddress, address payable coldWalletAddress) public onlyOwner {
        _coldWallet[tokenAddress] = coldWalletAddress;
        emit ColdWalletChanged(tokenAddress, coldWalletAddress);
    }

    function getColdWallet(address tokenAddress) public view returns(address payable){
        return _coldWallet[tokenAddress];
    }

    function createWallet() public returns(address) {
        address newWallet = address(new Wallet(address(this)));
        emit WalletCreated(newWallet, address(this));
        return newWallet;
    }
}