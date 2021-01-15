// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;
pragma experimental ABIEncoderV2;

import './Ownable.sol';
import './proxy/CloneFactory.sol';
import './Wallet.sol';
import './IERC20.sol';

contract WalletFactory is Ownable, CloneFactory {
    mapping(address => address payable) private _coldWallet;
    address private _wallet;

    event ColdWalletChanged(address tokenAddress, address coldWalletAddress);
    event WalletCreated(address walletAddress);

    struct withdraw {
        address tokenAddress;
        address payable to;
        uint256 amount;
    }

    constructor() public {
        _wallet = address(new Wallet());
        _coldWallet[address(0)] = msg.sender;
    }

    function replaceWalletContract(address newWalletContract) public onlyOwner {
        _wallet = newWalletContract;
    }

    function createWallet() public onlyOwner {
        address newWallet = createClone(_wallet);
        Wallet(payable(newWallet)).init(address(this));
        emit WalletCreated(newWallet);
    }

    function sendTokens(withdraw[] memory WithdrawList) public payable onlyManager {
        for(uint i=0 ; i<WithdrawList.length ; i++) {
            if(WithdrawList[i].tokenAddress == address(0)) {
                WithdrawList[i].to.transfer(WithdrawList[i].amount);
            } else {
                IERC20(WithdrawList[i].tokenAddress).transfer(WithdrawList[i].to, WithdrawList[i].amount);
            }
        }
    }

    function setColdWallet(address tokenAddress, address payable coldWalletAddress) public onlyOwner {
        _coldWallet[tokenAddress] = coldWalletAddress;
        emit ColdWalletChanged(tokenAddress, coldWalletAddress);
    }

    function getColdWallet(address tokenAddress) public view returns(address payable){
        return _coldWallet[tokenAddress];
    }

    receive() external payable {}
}